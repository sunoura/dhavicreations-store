-- Drop all tables in the correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS "product_images" CASCADE;
DROP TABLE IF EXISTS "product_tags" CASCADE;
DROP TABLE IF EXISTS "image_tags" CASCADE;
DROP TABLE IF EXISTS "admin_session" CASCADE;
DROP TABLE IF EXISTS "products" CASCADE;
DROP TABLE IF EXISTS "images" CASCADE;
DROP TABLE IF EXISTS "categories" CASCADE;
DROP TABLE IF EXISTS "admin" CASCADE; 