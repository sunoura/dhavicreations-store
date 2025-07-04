import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { AdminAuth } from '$lib/server/auth';

export const POST: RequestHandler = async ({ cookies }) => {
    try {
        const sessionId = AdminAuth.getSessionId(cookies);
        
        if (sessionId) {
            // Delete the session from database
            await AdminAuth.deleteSession(sessionId);
        }

        // Clear the session cookie
        AdminAuth.clearSessionCookie(cookies);

        return json({
            message: 'Logout successful'
        });

    } catch (error) {
        console.error('Admin logout error:', error);
        return json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}; 