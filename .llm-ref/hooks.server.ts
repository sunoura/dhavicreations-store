import type { Handle } from "@sveltejs/kit";
import { Auth } from "$lib/server/auth";

export const handle: Handle = async ({ event, resolve }) => {
    const sessionId = event.cookies.get("session");

    if (sessionId) {
        try {
            const user = await Auth.validateSession(sessionId);
            event.locals.user = user;
        } catch (error) {
            // Invalid session, remove cookie
            event.cookies.delete("session", { path: "/" });
        }
    }

    // Protect admin routes
    if (event.url.pathname.startsWith("/admin")) {
        if (!event.locals.user) {
            // Not logged in, redirect to login with return URL
            const redirectTo = encodeURIComponent(event.url.pathname);
            return new Response(null, {
                status: 302,
                headers: {
                    location: `/user/login?redirectTo=${redirectTo}`,
                },
            });
        }

        if (!Auth.isAdmin(event.locals.user)) {
            // Logged in but not admin, redirect to user dashboard
            return new Response(null, {
                status: 302,
                headers: {
                    location: "/user/dashboard",
                },
            });
        }
    }

    // Protect user dashboard (require any authenticated user)
    if (event.url.pathname.startsWith("/user/dashboard")) {
        if (!event.locals.user) {
            const redirectTo = encodeURIComponent(event.url.pathname);
            return new Response(null, {
                status: 302,
                headers: {
                    location: `/user/login?redirectTo=${redirectTo}`,
                },
            });
        }
    }

    // Allow root route to be accessed by everyone
    // Users can navigate to their preferred areas manually

    return resolve(event);
};

