import type { RequestEvent } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase64url, encodeHexLowerCase } from "@oslojs/encoding";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { hash, verify } from "@node-rs/argon2";
import type { Admin, AdminSession } from "./db/schema";
import type { Cookies } from "@sveltejs/kit";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const adminSessionCookieName = "admin-session";

// Simple in-memory rate limiting (for production, use Redis)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export interface AuthAdminSession {
    id: string;
    adminId: string;
    expiresAt: Date;
}

export interface AuthAdmin extends Omit<Admin, "passwordHash"> {}

export class AdminAuth {
    public static readonly SESSION_COOKIE_NAME = "admin-session";
    public static readonly SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

    /**
     * Check rate limiting for login attempts
     */
    private static checkRateLimit(identifier: string): boolean {
        const now = Date.now();
        const attempt = loginAttempts.get(identifier);
        
        if (!attempt) {
            loginAttempts.set(identifier, { count: 1, lastAttempt: now });
            return true;
        }

        // Reset if lockout period has passed
        if (now - attempt.lastAttempt > LOCKOUT_DURATION) {
            loginAttempts.set(identifier, { count: 1, lastAttempt: now });
            return true;
        }

        // Check if too many attempts
        if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
            return false;
        }

        // Increment attempt count
        attempt.count++;
        attempt.lastAttempt = now;
        return true;
    }

    /**
     * Clear rate limiting for successful login
     */
    private static clearRateLimit(identifier: string): void {
        loginAttempts.delete(identifier);
    }

    /**
     * Hash a password using Argon2
     */
    static async hashPassword(password: string): Promise<string> {
        return await hash(password, {
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1,
        });
    }

    /**
     * Verify a password against its hash
     */
    static async verifyPassword(
        hash: string,
        password: string
    ): Promise<boolean> {
        return await verify(hash, password);
    }

    /**
     * Create a new session for an admin
     */
    static async createSession(adminId: string): Promise<AuthAdminSession> {
        const sessionId = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + AdminAuth.SESSION_DURATION);

        await db.insert(table.adminSession).values({
            id: sessionId,
            adminId,
            expiresAt,
        });

        return {
            id: sessionId,
            adminId,
            expiresAt,
        };
    }

    /**
     * Validate a session and return the admin if valid
     */
    static async validateSession(sessionId: string): Promise<AuthAdmin | null> {
        const session = await db.query.adminSession.findFirst({
            where: eq(table.adminSession.id, sessionId),
            with: {
                admin: true,
            },
        });

        if (!session || !session.admin || session.expiresAt < new Date()) {
            return null;
        }

        // Remove password hash from admin object
        const { passwordHash: _, ...authAdmin } = session.admin;
        return authAdmin;
    }

    /**
     * Delete a session
     */
    static async deleteSession(sessionId: string): Promise<boolean> {
        const result = await db
            .delete(table.adminSession)
            .where(eq(table.adminSession.id, sessionId));
        return result.length > 0;
    }

    /**
     * Delete all sessions for an admin
     */
    static async deleteAllAdminSessions(adminId: string): Promise<number> {
        const result = await db
            .delete(table.adminSession)
            .where(eq(table.adminSession.adminId, adminId));
        return result.length;
    }

    /**
     * Set session cookie
     */
    static setSessionCookie(
        cookies: Cookies,
        sessionId: string,
        expiresAt: Date
    ): void {
        cookies.set(AdminAuth.SESSION_COOKIE_NAME, sessionId, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            expires: expiresAt,
        });
    }

    /**
     * Clear session cookie
     */
    static clearSessionCookie(cookies: Cookies): void {
        cookies.delete(AdminAuth.SESSION_COOKIE_NAME, {
            path: "/",
        });
    }

    /**
     * Get session ID from cookies
     */
    static getSessionId(cookies: Cookies): string | undefined {
        return cookies.get(AdminAuth.SESSION_COOKIE_NAME);
    }

    /**
     * Login admin with username and password
     */
    static async login(
        username: string,
        password: string
    ): Promise<{
        admin: AuthAdmin;
        session: AuthAdminSession;
    } | null> {
        // Check rate limiting
        if (!AdminAuth.checkRateLimit(username)) {
            return null;
        }

        // Find admin by username
        const admin = await db.query.admin.findFirst({
            where: eq(table.admin.username, username),
        });

        if (!admin || !admin.isActive) {
            return null;
        }

        // Verify password
        const isValidPassword = await AdminAuth.verifyPassword(
            admin.passwordHash,
            password
        );
        if (!isValidPassword) {
            return null;
        }

        // Clear rate limiting on successful login
        AdminAuth.clearRateLimit(username);

        // Create session
        const session = await AdminAuth.createSession(admin.id);

        // Remove password hash from admin object
        const { passwordHash: _, ...authAdmin } = admin;

        return {
            admin: authAdmin,
            session,
        };
    }

    /**
     * Logout admin by deleting session
     */
    static async logout(sessionId: string): Promise<boolean> {
        return await AdminAuth.deleteSession(sessionId);
    }

    /**
     * Clean up expired sessions
     */
    static async cleanupExpiredSessions(): Promise<number> {
        const result = await db
            .delete(table.adminSession)
            .where(eq(table.adminSession.expiresAt, new Date()));
        return result.length;
    }

    /**
     * Check if admin is authenticated
     */
    static isAuthenticated(admin: any): boolean {
        return !!admin;
    }

    /**
     * Require admin authentication
     */
    static requireAuth(locals: any) {
        if (!AdminAuth.isAuthenticated(locals.admin)) {
            throw new Error("Admin authentication required");
        }
        return locals.admin;
    }
}

// Legacy functions for compatibility
export function generateSessionToken() {
    return crypto.randomUUID();
}

export async function createSession(token: string, adminId: string) {
    const expiresAt = new Date(Date.now() + AdminAuth.SESSION_DURATION);
    
    await db.insert(table.adminSession).values({
        id: token,
        adminId,
        expiresAt,
    });

    return {
        id: token,
        adminId,
        expiresAt,
    };
}

export async function validateSessionToken(token: string) {
    return await AdminAuth.validateSession(token);
}

export type SessionValidationResult = Awaited<
    ReturnType<typeof validateSessionToken>
>;

export async function invalidateSession(sessionId: string) {
    return await AdminAuth.deleteSession(sessionId);
}

export function setSessionTokenCookie(
    event: RequestEvent,
    token: string,
    expiresAt: Date
) {
    event.cookies.set(AdminAuth.SESSION_COOKIE_NAME, token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expiresAt,
    });
}

export function deleteSessionTokenCookie(event: RequestEvent) {
    event.cookies.delete(AdminAuth.SESSION_COOKIE_NAME, {
        path: "/",
    });
}

