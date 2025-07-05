-- Fix cascade delete constraints for better data integrity

-- Drop existing foreign key constraints
ALTER TABLE "products" DROP CONSTRAINT "products_category_id_categories_id_fk";
ALTER TABLE "products" DROP CONSTRAINT "products_cover_image_id_images_id_fk";

-- Re-add with proper cascade behavior
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" 
    FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") 
    ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE "products" ADD CONSTRAINT "products_cover_image_id_images_id_fk" 
    FOREIGN KEY ("cover_image_id") REFERENCES "public"."images"("id") 
    ON DELETE SET NULL ON UPDATE NO ACTION; 