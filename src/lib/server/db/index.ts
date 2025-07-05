import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Load environment variables
config({ path: '.env' });

let DATABASE_URL: string;

try {
	const { DATABASE_URL: skDatabaseUrl } = await import('$env/static/private');
	DATABASE_URL = skDatabaseUrl;
} catch {
	DATABASE_URL = process.env.DATABASE_URL || '';
}

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(DATABASE_URL);

export const db = drizzle(client, { schema });
