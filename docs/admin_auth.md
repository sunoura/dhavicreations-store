# Admin Authentication System

## Overview

The admin authentication system provides secure, isolated authentication for administrative users. It uses separate database tables and session management to prevent privilege escalation from regular users.

## Architecture

### Database Schema

```sql
-- Admin users table
CREATE TABLE admin (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Admin sessions table
CREATE TABLE admin_session (
    id TEXT PRIMARY KEY,
    admin_id TEXT NOT NULL REFERENCES admin(id),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);
```

### Key Features

- **Separate Tables**: Admin users are completely isolated from regular users
- **Argon2 Hashing**: Industry-standard password hashing with high memory cost
- **Session Management**: Secure session-based authentication with automatic cleanup
- **Rate Limiting**: Protection against brute force attacks
- **Security Headers**: Comprehensive security headers for admin routes
- **Input Validation**: Strict input validation and sanitization

## Security Features

### Password Security

- **Algorithm**: Argon2 with high memory cost (19,456 KB)
- **Time Cost**: 2 iterations
- **Output Length**: 32 bytes
- **Parallelism**: 1 thread

### Session Security

- **Duration**: 30 days
- **Cookies**: HTTP-only, secure, SameSite=lax
- **Cleanup**: Automatic expiration and cleanup
- **Tokens**: Cryptographically secure UUIDs

### Rate Limiting

- **Max Attempts**: 5 login attempts
- **Lockout Duration**: 15 minutes
- **Reset**: Automatic reset after successful login

### Input Validation

- **Username**: 3-50 characters, trimmed
- **Password**: Minimum 6 characters
- **Sanitization**: HTML entity encoding
- **Type Checking**: Strict type validation

## API Endpoints

### POST `/api/auth/admin/login`

Authenticates an admin user and creates a session.

**Request:**

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (Success - 200):**

```json
{
  "admin": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "message": "Login successful"
}
```

**Response (Error - 400):**

```json
{
  "error": "Username and password are required"
}
```

**Response (Error - 401):**

```json
{
  "error": "Invalid username or password"
}
```

### POST `/api/auth/admin/logout`

Logs out an admin user by invalidating their session.

**Response (Success - 200):**

```json
{
  "message": "Logout successful"
}
```

## Route Protection

### Protected Routes

All routes under `/admin/*` are protected except for `/admin/login`.

### Authentication Flow

1. **Unauthenticated Access**: Redirected to `/admin/login`
2. **Authenticated Access**: Redirected to `/admin/dashboard`
3. **Session Validation**: Automatic validation on each request
4. **Error Handling**: Graceful session invalidation on errors

### Middleware Behavior

```typescript
// hooks.server.ts logic
if (pathname.startsWith('/admin')) {
  if (pathname === '/admin/login') {
    if (authenticated) redirect('/admin/dashboard')
    else allow access
  } else {
    if (!authenticated) redirect('/admin/login?redirectTo=' + pathname)
    else allow access
  }
}
```

## State Management

### Svelte 5 Context API

The system uses Svelte 5's Context API for state management:

```typescript
// Admin state interface
interface AdminState {
  admin: AuthAdmin | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// Context actions
const actions = {
  setAdmin(admin: AuthAdmin | null): void;
  setLoading(loading: boolean): void;
  logout(): void;
}
```

### AdminProvider Component

Wraps admin routes to provide authentication context:

```svelte
<script>
  import AdminProvider from '$lib/components/AdminProvider.svelte';
</script>

<AdminProvider>
  <slot />
</AdminProvider>
```

## Database Operations

### Creating an Admin

```bash
# Create initial admin user
pnpm create-admin

# Default credentials:
# Username: admin
# Password: admin123
# Email: admin@example.com
```

### Session Cleanup

```typescript
// Clean up expired sessions
await AdminAuth.cleanupExpiredSessions();
```

### Manual Admin Creation

```typescript
import { AdminAuth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { admin } from "$lib/server/db/schema";

const passwordHash = await AdminAuth.hashPassword("secure_password");
await db.insert(admin).values({
  id: crypto.randomUUID(),
  username: "newadmin",
  email: "newadmin@example.com",
  passwordHash,
  firstName: "New",
  lastName: "Admin",
  isActive: true,
});
```

## Security Headers

### Admin Route Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'
```

## Error Handling

### Common Error Scenarios

1. **Invalid Session**: Automatic cleanup and redirect to login
2. **Rate Limit Exceeded**: Temporary lockout with clear messaging
3. **Database Errors**: Graceful fallback with logging
4. **Network Issues**: User-friendly error messages

### Error Responses

```typescript
// Rate limiting
{
  error: "Too many login attempts. Please try again later.";
}

// Invalid credentials
{
  error: "Invalid username or password";
}

// Server errors
{
  error: "Internal server error";
}
```

## Development Tools

### Debug Component

```svelte
<!-- Only shows in development -->
<script>
  import DebugAdmin from '$lib/components/DebugAdmin.svelte';
</script>

<DebugAdmin />
```

### Database Studio

```bash
# View database schema and data
pnpm db:studio
```

## Production Considerations

### Environment Variables

```bash
# Required
DATABASE_URL="postgresql://username:password@host:port/database"

# Optional
NODE_ENV="production"  # Enables secure cookies
```

### Security Checklist

- [ ] Change default admin credentials
- [ ] Set up proper database backups
- [ ] Configure production database connection
- [ ] Set up monitoring and logging
- [ ] Consider Redis for rate limiting (optional)
- [ ] Set up SSL/TLS certificates
- [ ] Configure proper CORS settings

### Performance Optimizations

- **Database Indexes**: Ensure proper indexing on username and session_id
- **Connection Pooling**: Configure database connection pooling
- **Caching**: Consider Redis for session storage (optional)
- **Monitoring**: Set up application performance monitoring

## Troubleshooting

### Common Issues

#### "Cannot find package '$env'" Error

**Cause**: Script trying to use SvelteKit's $env outside of SvelteKit context
**Solution**: Ensure `.env` file exists with `DATABASE_URL` set

#### "Invalid username or password"

**Cause**: Admin user doesn't exist or credentials are incorrect
**Solution**:

1. Check if admin exists: `pnpm db:studio`
2. Create admin: `pnpm create-admin`
3. Verify credentials

#### Redirect Loops

**Cause**: Authentication middleware logic error
**Solution**:

1. Check `hooks.server.ts` logic
2. Verify session cookie is being set
3. Check database connection

#### Session Not Persisting

**Cause**: Cookie configuration or database issues
**Solution**:

1. Check cookie settings in `AdminAuth.setSessionCookie`
2. Verify database session table exists
3. Check browser console for JavaScript errors

### Debug Commands

```bash
# Check database schema
pnpm db:studio

# Create new admin user
pnpm create-admin

# Push schema changes
pnpm db:push

# Check for expired sessions
# (Add to maintenance scripts)
```

## File Structure

```
src/
├── lib/
│   ├── server/
│   │   ├── auth.ts              # Admin authentication logic
│   │   ├── security.ts          # Security utilities
│   │   └── db/
│   │       ├── index.ts         # Database connection
│   │       └── schema.ts        # Database schema
│   ├── stores/
│   │   └── admin.svelte.ts      # Admin state management
│   └── components/
│       ├── AdminProvider.svelte # Admin context provider
│       └── DebugAdmin.svelte    # Debug component
├── routes/
│   ├── admin/
│   │   ├── +layout.svelte       # Admin layout
│   │   ├── +page.server.ts      # Redirect logic
│   │   ├── login/
│   │   │   └── +page.svelte     # Login form
│   │   └── (protected)/
│   │       └── dashboard/
│   │           ├── +page.svelte      # Dashboard UI
│   │           └── +page.server.ts   # Dashboard data
│   └── api/auth/admin/
│       ├── login/
│       │   └── +server.ts       # Login API endpoint
│       └── logout/
│           └── +server.ts       # Logout API endpoint
├── hooks.server.ts              # Authentication middleware
└── scripts/
    ├── db.ts                    # Standalone database connection
    └── create-admin.ts          # Admin user creation script
```

## Migration Guide

### From Svelte 4 to Svelte 5

- ✅ **Event Handling**: `on:click` → `onclick`
- ✅ **State Management**: `$state` runes instead of stores
- ✅ **Effects**: `$effect` instead of `$:`
- ✅ **Context API**: Modern context patterns

### From Mixed User System

- ✅ **Separate Tables**: Admin and user tables are isolated
- ✅ **No Role Escalation**: Admins can only be created manually
- ✅ **Clean Separation**: No shared authentication logic

## Best Practices

### Security

1. **Never store passwords in plain text**
2. **Use HTTPS in production**
3. **Implement proper session management**
4. **Validate and sanitize all inputs**
5. **Set appropriate security headers**
6. **Use rate limiting for login attempts**
7. **Log security events**

### Development

1. **Use TypeScript for type safety**
2. **Follow Svelte 5 patterns**
3. **Implement proper error handling**
4. **Use context for state management**
5. **Write comprehensive tests**
6. **Document API endpoints**

### Production

1. **Monitor authentication events**
2. **Set up automated backups**
3. **Use environment variables**
4. **Implement proper logging**
5. **Set up monitoring and alerting**
6. **Regular security audits**

## API Reference

### AdminAuth Class

```typescript
class AdminAuth {
  static async hashPassword(password: string): Promise<string>;
  static async verifyPassword(hash: string, password: string): Promise<boolean>;
  static async createSession(adminId: string): Promise<AuthAdminSession>;
  static async validateSession(sessionId: string): Promise<AuthAdmin | null>;
  static async deleteSession(sessionId: string): Promise<boolean>;
  static async login(
    username: string,
    password: string
  ): Promise<{ admin: AuthAdmin; session: AuthAdminSession } | null>;
  static async logout(sessionId: string): Promise<boolean>;
  static setSessionCookie(
    cookies: Cookies,
    sessionId: string,
    expiresAt: Date
  ): void;
  static clearSessionCookie(cookies: Cookies): void;
  static getSessionId(cookies: Cookies): string | undefined;
  static isAuthenticated(admin: any): boolean;
  static requireAuth(locals: any): AuthAdmin;
}
```

### Types

```typescript
interface AuthAdmin {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthAdminSession {
  id: string;
  adminId: string;
  expiresAt: Date;
}
```

## Changelog

### v1.0.0 (Current)

- ✅ Initial admin authentication system
- ✅ Svelte 5 compatibility
- ✅ Rate limiting implementation
- ✅ Security headers
- ✅ Input validation
- ✅ Session management
- ✅ Database schema
- ✅ API endpoints
- ✅ Route protection
- ✅ State management
- ✅ Debug tools
- ✅ Documentation

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review the error logs
3. Verify environment configuration
4. Test with debug components
5. Check database connectivity

The admin authentication system is production-ready and follows security best practices.
