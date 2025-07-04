import type { Handle } from "@sveltejs/kit";
import { AdminAuth } from "$lib/server/auth";
import { setSecurityHeaders } from "$lib/server/security";

export const handle: Handle = async ({ event, resolve }) => {
    // Set security headers
    setSecurityHeaders(event);
    const sessionId = AdminAuth.getSessionId(event.cookies);

    if (sessionId) {
        try {
            const admin = await AdminAuth.validateSession(sessionId);
            event.locals.admin = admin;
        } catch (error) {
            // Invalid session, remove cookie
            AdminAuth.clearSessionCookie(event.cookies);
        }
    }

    // Protect admin routes
    if (event.url.pathname.startsWith("/admin")) {
        // Allow access to login page
        if (event.url.pathname === "/admin/login") {
            // If already logged in, redirect to dashboard
            if (event.locals.admin) {
                return new Response(null, {
                    status: 302,
                    headers: {
                        location: "/admin/dashboard",
                    },
                });
            }
            return resolve(event);
        }

        // Check if admin is authenticated for all other admin routes
        if (!event.locals.admin) {
            // Not logged in, redirect to login with return URL
            const redirectTo = encodeURIComponent(event.url.pathname);
            return new Response(null, {
                status: 302,
                headers: {
                    location: `/admin/login?redirectTo=${redirectTo}`,
                },
            });
        }
    }

    return resolve(event);
}; 