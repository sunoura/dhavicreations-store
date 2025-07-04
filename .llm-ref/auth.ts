import type { RequestEvent } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase64url, encodeHexLowerCase } from "@oslojs/encoding";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { UserOps } from "$lib/services/users";
import { hash, verify } from "@node-rs/argon2";
import type { User } from "./db/schema";
import type { Cookies } from "@sveltejs/kit";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = "auth-session";

export interface AuthSession {
    id: string;
    userId: string;
    expiresAt: Date;
}

export interface AuthUser extends Omit<User, "passwordHash"> {}

export class Auth {
    private static readonly SESSION_COOKIE_NAME = "session";
    private static readonly SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

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
     * Create a new session for a user
     */
    static async createSession(userId: string): Promise<AuthSession> {
        const sessionId = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + Auth.SESSION_DURATION);

        await UserOps.createSession({
            id: sessionId,
            userId,
            expiresAt,
        });

        return {
            id: sessionId,
            userId,
            expiresAt,
        };
    }

    /**
     * Validate a session and return the user if valid
     */
    static async validateSession(sessionId: string): Promise<AuthUser | null> {
        const user = await UserOps.getUserBySession(sessionId);
        if (!user) {
            return null;
        }

        // Remove password hash from user object
        const { passwordHash: _, ...authUser } = user;
        return authUser;
    }

    /**
     * Delete a session
     */
    static async deleteSession(sessionId: string): Promise<boolean> {
        return await UserOps.deleteSession(sessionId);
    }

    /**
     * Delete all sessions for a user
     */
    static async deleteAllUserSessions(userId: string): Promise<number> {
        return await UserOps.deleteAllUserSessions(userId);
    }

    /**
     * Set session cookie
     */
    static setSessionCookie(
        cookies: Cookies,
        sessionId: string,
        expiresAt: Date
    ): void {
        cookies.set(Auth.SESSION_COOKIE_NAME, sessionId, {
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
        cookies.delete(Auth.SESSION_COOKIE_NAME, {
            path: "/",
        });
    }

    /**
     * Get session ID from cookies
     */
    static getSessionId(cookies: Cookies): string | undefined {
        return cookies.get(Auth.SESSION_COOKIE_NAME);
    }

    /**
     * Login user with email and password
     */
    static async login(
        email: string,
        password: string
    ): Promise<{
        user: AuthUser;
        session: AuthSession;
    } | null> {
        // Find user by email
        const user = await UserOps.getByEmail(email);
        if (!user) {
            return null;
        }

        // Verify password
        const isValidPassword = await Auth.verifyPassword(
            user.passwordHash,
            password
        );
        if (!isValidPassword) {
            return null;
        }

        // Create session
        const session = await Auth.createSession(user.id);

        // Remove password hash from user object
        const { passwordHash: _, ...authUser } = user;

        return {
            user: authUser,
            session,
        };
    }

    /**
     * Logout user by deleting session
     */
    static async logout(sessionId: string): Promise<boolean> {
        return await Auth.deleteSession(sessionId);
    }

    /**
     * Register a new user
     */
    static async register(userData: {
        email: string;
        password: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
        address?: string;
        city?: string;
        state?: string;
        pincode?: string;
        country?: string;
    }): Promise<{
        user: AuthUser;
        session: AuthSession;
    } | null> {
        // Check if email already exists
        const emailExists = await UserOps.emailExists(userData.email);
        if (emailExists) {
            return null;
        }

        // Check if phone already exists (if provided)
        if (userData.phone) {
            const phoneExists = await UserOps.phoneExists(userData.phone);
            if (phoneExists) {
                return null;
            }
        }

        // Hash password
        const passwordHash = await Auth.hashPassword(userData.password);

        // Create user
        const user = await UserOps.create({
            id: crypto.randomUUID(),
            email: userData.email,
            passwordHash,
            firstName: userData.firstName || undefined,
            lastName: userData.lastName || undefined,
            phone: userData.phone || undefined,
            address: userData.address || undefined,
            city: userData.city || undefined,
            state: userData.state || undefined,
            pincode: userData.pincode || undefined,
            country: userData.country || undefined,
        });

        // Create session
        const session = await Auth.createSession(user.id);

        // Remove password hash from user object
        const { passwordHash: _, ...authUser } = user;

        return {
            user: authUser,
            session,
        };
    }

    /**
     * Clean up expired sessions
     */
    static async cleanupExpiredSessions(): Promise<number> {
        return await UserOps.cleanupExpiredSessions();
    }

    /**
     * Check if user has admin privileges
     */
    static isAdmin(user: any): boolean {
        return user?.role === "admin";
    }

    /**
     * Check if user can access/modify a specific user resource
     */
    static canAccessUser(currentUser: any, targetUserId: string): boolean {
        if (!currentUser) return false;
        // Admin can access any user, regular users can only access themselves
        return this.isAdmin(currentUser) || currentUser.id === targetUserId;
    }

    /**
     * Middleware to require authentication
     */
    static requireAuth(locals: any) {
        if (!locals.user) {
            throw new Error("Authentication required");
        }
        return locals.user;
    }

    /**
     * Middleware to require admin privileges
     */
    static requireAdmin(locals: any) {
        const user = this.requireAuth(locals);
        if (!this.isAdmin(user)) {
            throw new Error("Admin privileges required");
        }
        return user;
    }

    /**
     * Middleware to require user ownership or admin
     */
    static requireUserOrAdmin(locals: any, targetUserId: string) {
        const user = this.requireAuth(locals);
        if (!this.canAccessUser(user, targetUserId)) {
            throw new Error("Insufficient permissions");
        }
        return user;
    }
}

export function generateSessionToken() {
    const bytes = crypto.getRandomValues(new Uint8Array(18));
    const token = encodeBase64url(bytes);
    return token;
}

export async function createSession(token: string, userId: string) {
    const sessionId = encodeHexLowerCase(
        sha256(new TextEncoder().encode(token))
    );
    const session: table.Session = {
        id: sessionId,
        userId,
        expiresAt: new Date(Date.now() + DAY_IN_MS * 30),
    };
    await db.insert(table.session).values(session);
    return session;
}

export async function validateSessionToken(token: string) {
    const sessionId = encodeHexLowerCase(
        sha256(new TextEncoder().encode(token))
    );
    const [result] = await db
        .select({
            // Adjust user table here to tweak returned data
            user: { id: table.user.id, email: table.user.email },
            session: table.session,
        })
        .from(table.session)
        .innerJoin(table.user, eq(table.session.userId, table.user.id))
        .where(eq(table.session.id, sessionId));

    if (!result) {
        return { session: null, user: null };
    }
    const { session, user } = result;

    const sessionExpired = Date.now() >= session.expiresAt.getTime();
    if (sessionExpired) {
        await db.delete(table.session).where(eq(table.session.id, session.id));
        return { session: null, user: null };
    }

    const renewSession =
        Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15;
    if (renewSession) {
        session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30);
        await db
            .update(table.session)
            .set({ expiresAt: session.expiresAt })
            .where(eq(table.session.id, session.id));
    }

    return { session, user };
}

export type SessionValidationResult = Awaited<
    ReturnType<typeof validateSessionToken>
>;

export async function invalidateSession(sessionId: string) {
    await db.delete(table.session).where(eq(table.session.id, sessionId));
}

export function setSessionTokenCookie(
    event: RequestEvent,
    token: string,
    expiresAt: Date
) {
    event.cookies.set(sessionCookieName, token, {
        expires: expiresAt,
        path: "/",
    });
}

export function deleteSessionTokenCookie(event: RequestEvent) {
    event.cookies.delete(sessionCookieName, {
        path: "/",
    });
}

