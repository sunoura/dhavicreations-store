import type { RequestEvent } from '@sveltejs/kit';

/**
 * Set security headers for admin routes
 */
export function setSecurityHeaders(event: RequestEvent): void {
    // Set security headers
    event.setHeaders({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    });

    // Set CSP header for admin routes
    if (event.url.pathname.startsWith('/admin')) {
        event.setHeaders({
            'Content-Security-Policy': [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: https:",
                "font-src 'self'",
                "connect-src 'self'",
                "frame-ancestors 'none'"
            ].join('; ')
        });
    }
}

/**
 * Validate and sanitize admin input
 */
export function sanitizeAdminInput(input: any): string {
    if (typeof input !== 'string') {
        throw new Error('Invalid input type');
    }
    
    return input.trim().replace(/[<>]/g, '');
}

/**
 * Check if request is from allowed origin
 */
export function isAllowedOrigin(origin: string): boolean {
    const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:4173',
        'https://yourdomain.com' // Add your production domain
    ];
    
    return allowedOrigins.includes(origin);
} 