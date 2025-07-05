import { config } from 'dotenv';
import postgres from 'postgres';

config({ path: '.env' });

const sql = postgres(process.env.DATABASE_URL);

async function resetDatabase() {
  try {
    console.log('Dropping all tables...');
    
    // Drop tables in correct order (respecting foreign key constraints)
    await sql`DROP TABLE IF EXISTS "product_images" CASCADE`;
    await sql`DROP TABLE IF EXISTS "product_tags" CASCADE`;
    await sql`DROP TABLE IF EXISTS "image_tags" CASCADE`;
    await sql`DROP TABLE IF EXISTS "admin_session" CASCADE`;
    await sql`DROP TABLE IF EXISTS "products" CASCADE`;
    await sql`DROP TABLE IF EXISTS "images" CASCADE`;
    await sql`DROP TABLE IF EXISTS "categories" CASCADE`;
    await sql`DROP TABLE IF EXISTS "admin" CASCADE`;
    
    console.log('All tables dropped successfully!');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    await sql.end();
  }
}

resetDatabase(); 