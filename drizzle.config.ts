import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';


if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

config({ path: '.env' });

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './supabase/migrations',
	dialect: 'postgresql',
	dbCredentials: { url: process.env.DATABASE_URL },
	verbose: true,
	strict: true
});
