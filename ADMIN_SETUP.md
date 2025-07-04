# Admin Authentication Setup

This document explains how to set up and use the admin authentication system for your ecommerce store.

## Overview

The admin authentication system uses:

- Separate `admin` and `adminSession` tables (not mixed with regular users)
- Argon2 password hashing for security
- Session-based authentication with cookies
- Protected routes using SvelteKit hooks
- Svelte 5 runes and modern state management patterns

## Database Setup

1. **Set up your environment variables:**
   Create a `.env` file in your project root with:

   ```bash
   DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name"
   ```

   Examples:

   - **Supabase:** `DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"`
   - **Local PostgreSQL:** `DATABASE_URL="postgresql://postgres:password@localhost:5432/dc05"`

2. **Push the schema to your database:**

   ```bash
   pnpm db:push
   ```

3. **Create an initial admin user:**

   ```bash
   pnpm create-admin
   ```

   This creates an admin with:

   - Username: `admin`
   - Password: `admin123`
   - Email: `admin@example.com`

   **⚠️ IMPORTANT: Change these credentials immediately after first login!**

## File Structure

```
src/
├── lib/
│   ├── server/
│   │   ├── auth.ts              # Admin authentication logic
│   │   └── db/
│   │       └── schema.ts        # Database schema (admin + adminSession tables)
│   ├── stores/
│   │   └── admin.svelte.ts      # Admin state management (Svelte 5)
│   └── components/
│       ├── AdminProvider.svelte # Admin context provider
│       └── DebugAdmin.svelte    # Debug component (dev only)
├── routes/
│   ├── admin/
│   │   ├── +layout.svelte       # Admin layout with AdminProvider
│   │   ├── +page.server.ts      # Redirect logic
│   │   ├── login/
│   │   │   └── +page.svelte     # Login form (Svelte 5 syntax)
│   │   └── (protected)/
│   │       └── dashboard/
│   │           ├── +page.svelte      # Dashboard UI (Svelte 5 syntax)
│   │           └── +page.server.ts   # Dashboard data
│   └── api/auth/admin/
│       ├── login/
│       │   └── +server.ts       # Login API endpoint
│       └── logout/
│           └── +server.ts       # Logout API endpoint
├── hooks.server.ts              # Authentication middleware
└── scripts/
    └── create-admin.ts          # Admin user creation script
```

## How It Works

### Authentication Flow

1. **Login:** User submits username/password to `/api/auth/admin/login`
2. **Validation:** Server verifies credentials and creates session
3. **Cookie:** Session ID is stored in HTTP-only cookie
4. **Middleware:** `hooks.server.ts` validates session on each request
5. **Protection:** Unauthenticated users are redirected to login

### Route Protection

- `/admin/*` routes are protected by authentication middleware
- `/admin/login` is accessible to everyone
- Authenticated users trying to access `/admin/login` are redirected to dashboard
- Unauthenticated users trying to access protected routes are redirected to login

### Session Management

- Sessions last 30 days by default
- Sessions are stored in the `adminSession` table
- Expired sessions are automatically cleaned up
- Logout deletes the session and clears the cookie

## API Endpoints

### POST `/api/auth/admin/login`

**Request:**

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**

```json
{
  "admin": {
    "id": "...",
    "username": "admin",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  },
  "message": "Login successful"
}
```

### POST `/api/auth/admin/logout`

**Response:**

```json
{
  "message": "Logout successful"
}
```

## Security Features

- **Password Hashing:** Argon2 with high memory cost
- **Session Security:** HTTP-only, secure cookies
- **Route Protection:** Server-side authentication checks
- **Separate Tables:** Admin users isolated from regular users
- **Manual Creation:** Admins can only be created via script (no self-registration)

## Svelte 5 Features

- **Runes:** Uses `$state` for reactive state management
- **Modern Event Handling:** Uses `onclick`, `oninput` instead of `on:click`, `on:input`
- **Context API:** Admin state shared via `setContext`/`getContext`
- **Effects:** Uses `$effect` for side effects and debugging
- **State Snapshotting:** Debug state changes with proper logging

## Next Steps

1. **Change Default Credentials:** Update the admin password and email after first login
2. **Add More Admins:** Create additional admin users as needed
3. **Product Management:** Build CRUD operations for products
4. **User Management:** Set up regular user authentication system
5. **Role-Based Access:** Add different admin roles if needed

## Troubleshooting

### Common Issues

1. **"Cannot find package '$env'" error when running create-admin script**

   - Make sure you have a `.env` file with `DATABASE_URL` set
   - The script uses a separate database connection that doesn't rely on SvelteKit's `$env`
   - Check that your database is running and accessible

2. **"Invalid username or password"**

   - Check if admin user exists in database
   - Verify username/password are correct
   - Ensure admin is active (`isActive: true`)

3. **Redirect loops**

   - Check `hooks.server.ts` logic
   - Verify session cookie is being set correctly
   - Check database connection

4. **Session not persisting**
   - Check cookie settings in `AdminAuth.setSessionCookie`
   - Verify database session table exists
   - Check for JavaScript errors in browser console

### Debug Commands

```bash
# Check database schema
pnpm db:studio

# Create new admin user
pnpm create-admin

# Check for expired sessions
# (Add cleanup function to your maintenance scripts)
```
