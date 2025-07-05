import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables
config({ path: '.env' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	console.error('DATABASE_URL is not set');
	process.exit(1);
}

console.log('Testing database connection...');
console.log('DATABASE_URL:', DATABASE_URL.replace(/:[^:@]*@/, ':****@')); // Hide password

const sql = postgres(DATABASE_URL);

async function testConnection() {
	try {
		console.log('Attempting to connect...');

		// Simple query to test connection
		const result = await sql`SELECT version()`;
		console.log('✅ Database connection successful!');
		console.log('PostgreSQL version:', result[0].version);

		// Test if tables exist
		const tables = await sql`
			SELECT table_name 
			FROM information_schema.tables 
			WHERE table_schema = 'public'
			ORDER BY table_name
		`;

		console.log('📋 Tables in database:');
		tables.forEach((table) => {
			console.log(`  - ${table.table_name}`);
		});
	} catch (error) {
		console.error('❌ Database connection failed:', error);
	} finally {
		await sql.end();
		process.exit(0);
	}
}

testConnection();
