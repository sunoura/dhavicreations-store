import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables
config({ path: '.env' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	console.error('DATABASE_URL is not set');
	process.exit(1);
}

const sql = postgres(DATABASE_URL);

async function applyImagesMigration() {
	try {
		console.log('Applying images tables migration...');

		// Create images table
		await sql`
			CREATE TABLE IF NOT EXISTS "images" (
				"id" serial PRIMARY KEY NOT NULL,
				"image_url" text NOT NULL,
				"thumb_url" text NOT NULL,
				"filename" text NOT NULL,
				"title" text,
				"description" text,
				"size" bigint NOT NULL,
				"created_at" timestamp with time zone DEFAULT now() NOT NULL,
				"updated_at" timestamp with time zone DEFAULT now() NOT NULL
			);
		`;

		console.log('✓ Created images table');

		// Create image_tags table
		await sql`
			CREATE TABLE IF NOT EXISTS "image_tags" (
				"id" serial PRIMARY KEY NOT NULL,
				"image_id" integer NOT NULL,
				"tag_name" varchar(100) NOT NULL,
				"created_at" timestamp with time zone DEFAULT now() NOT NULL
			);
		`;

		console.log('✓ Created image_tags table');

		// Add foreign key constraint
		await sql`
			ALTER TABLE "image_tags" 
			ADD CONSTRAINT "image_tags_image_id_images_id_fk" 
			FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") 
			ON DELETE cascade ON UPDATE no action;
		`;

		console.log('✓ Added foreign key constraint');

		console.log('Migration applied successfully!');
	} catch (error) {
		console.error('Error applying migration:', error);
		process.exit(1);
	} finally {
		await sql.end();
	}
}

applyImagesMigration();
