import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Load environment variables
config({ path: '.env' });

// Get DATABASE_URL from environment (works in both SvelteKit and standalone scripts)
let DATABASE_URL: string;

try {
    // Try to use SvelteKit's $env (if available)
    const { DATABASE_URL: skDatabaseUrl } = await import('$env/static/private');
    DATABASE_URL = skDatabaseUrl;
} catch {
    // Fallback to process.env for standalone scripts
    DATABASE_URL = process.env.DATABASE_URL || '';
}

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(DATABASE_URL);

export const db = drizzle(client, { schema });
