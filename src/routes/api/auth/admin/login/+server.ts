import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { AdminAuth } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        const { username, password } = await request.json();

        // Input validation
        if (!username || !password) {
            return json(
                { error: 'Username and password are required' },
                { status: 400 }
            );
        }

        // Sanitize inputs
        const sanitizedUsername = username.toString().trim();
        const sanitizedPassword = password.toString();

        if (sanitizedUsername.length < 3 || sanitizedUsername.length > 50) {
            return json(
                { error: 'Username must be between 3 and 50 characters' },
                { status: 400 }
            );
        }

        if (sanitizedPassword.length < 6) {
            return json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Attempt to login
        const result = await AdminAuth.login(sanitizedUsername, sanitizedPassword);

        if (!result) {
            return json(
                { error: 'Invalid username or password' },
                { status: 401 }
            );
        }

        // Set session cookie
        AdminAuth.setSessionCookie(cookies, result.session.id, result.session.expiresAt);

        // Return admin data (without password hash)
        return json({
            admin: result.admin,
            message: 'Login successful'
        });

    } catch (error) {
        console.error('Admin login error:', error);
        return json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
};
