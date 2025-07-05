create schema if not exists "drizzle";

create sequence "drizzle"."__drizzle_migrations_id_seq";

create table "drizzle"."__drizzle_migrations" (
    "id" integer not null default nextval('drizzle.__drizzle_migrations_id_seq'::regclass),
    "hash" text not null,
    "created_at" bigint
);


alter sequence "drizzle"."__drizzle_migrations_id_seq" owned by "drizzle"."__drizzle_migrations"."id";

CREATE UNIQUE INDEX __drizzle_migrations_pkey ON drizzle.__drizzle_migrations USING btree (id);

alter table "drizzle"."__drizzle_migrations" add constraint "__drizzle_migrations_pkey" PRIMARY KEY using index "__drizzle_migrations_pkey";


revoke delete on table "public"."categories" from "anon";

revoke insert on table "public"."categories" from "anon";

revoke references on table "public"."categories" from "anon";

revoke select on table "public"."categories" from "anon";

revoke trigger on table "public"."categories" from "anon";

revoke truncate on table "public"."categories" from "anon";

revoke update on table "public"."categories" from "anon";

revoke delete on table "public"."categories" from "authenticated";

revoke insert on table "public"."categories" from "authenticated";

revoke references on table "public"."categories" from "authenticated";

revoke select on table "public"."categories" from "authenticated";

revoke trigger on table "public"."categories" from "authenticated";

revoke truncate on table "public"."categories" from "authenticated";

revoke update on table "public"."categories" from "authenticated";

revoke delete on table "public"."categories" from "service_role";

revoke insert on table "public"."categories" from "service_role";

revoke references on table "public"."categories" from "service_role";

revoke select on table "public"."categories" from "service_role";

revoke trigger on table "public"."categories" from "service_role";

revoke truncate on table "public"."categories" from "service_role";

revoke update on table "public"."categories" from "service_role";

revoke delete on table "public"."product_images" from "anon";

revoke insert on table "public"."product_images" from "anon";

revoke references on table "public"."product_images" from "anon";

revoke select on table "public"."product_images" from "anon";

revoke trigger on table "public"."product_images" from "anon";

revoke truncate on table "public"."product_images" from "anon";

revoke update on table "public"."product_images" from "anon";

revoke delete on table "public"."product_images" from "authenticated";

revoke insert on table "public"."product_images" from "authenticated";

revoke references on table "public"."product_images" from "authenticated";

revoke select on table "public"."product_images" from "authenticated";

revoke trigger on table "public"."product_images" from "authenticated";

revoke truncate on table "public"."product_images" from "authenticated";

revoke update on table "public"."product_images" from "authenticated";

revoke delete on table "public"."product_images" from "service_role";

revoke insert on table "public"."product_images" from "service_role";

revoke references on table "public"."product_images" from "service_role";

revoke select on table "public"."product_images" from "service_role";

revoke trigger on table "public"."product_images" from "service_role";

revoke truncate on table "public"."product_images" from "service_role";

revoke update on table "public"."product_images" from "service_role";

revoke delete on table "public"."product_tags" from "anon";

revoke insert on table "public"."product_tags" from "anon";

revoke references on table "public"."product_tags" from "anon";

revoke select on table "public"."product_tags" from "anon";

revoke trigger on table "public"."product_tags" from "anon";

revoke truncate on table "public"."product_tags" from "anon";

revoke update on table "public"."product_tags" from "anon";

revoke delete on table "public"."product_tags" from "authenticated";

revoke insert on table "public"."product_tags" from "authenticated";

revoke references on table "public"."product_tags" from "authenticated";

revoke select on table "public"."product_tags" from "authenticated";

revoke trigger on table "public"."product_tags" from "authenticated";

revoke truncate on table "public"."product_tags" from "authenticated";

revoke update on table "public"."product_tags" from "authenticated";

revoke delete on table "public"."product_tags" from "service_role";

revoke insert on table "public"."product_tags" from "service_role";

revoke references on table "public"."product_tags" from "service_role";

revoke select on table "public"."product_tags" from "service_role";

revoke trigger on table "public"."product_tags" from "service_role";

revoke truncate on table "public"."product_tags" from "service_role";

revoke update on table "public"."product_tags" from "service_role";

revoke delete on table "public"."products" from "anon";

revoke insert on table "public"."products" from "anon";

revoke references on table "public"."products" from "anon";

revoke select on table "public"."products" from "anon";

revoke trigger on table "public"."products" from "anon";

revoke truncate on table "public"."products" from "anon";

revoke update on table "public"."products" from "anon";

revoke delete on table "public"."products" from "authenticated";

revoke insert on table "public"."products" from "authenticated";

revoke references on table "public"."products" from "authenticated";

revoke select on table "public"."products" from "authenticated";

revoke trigger on table "public"."products" from "authenticated";

revoke truncate on table "public"."products" from "authenticated";

revoke update on table "public"."products" from "authenticated";

revoke delete on table "public"."products" from "service_role";

revoke insert on table "public"."products" from "service_role";

revoke references on table "public"."products" from "service_role";

revoke select on table "public"."products" from "service_role";

revoke trigger on table "public"."products" from "service_role";

revoke truncate on table "public"."products" from "service_role";

revoke update on table "public"."products" from "service_role";

alter table "public"."categories" drop constraint "categories_name_unique";

alter table "public"."categories" drop constraint "categories_slug_unique";

alter table "public"."product_images" drop constraint "product_images_image_id_images_id_fk";

alter table "public"."product_images" drop constraint "product_images_product_id_products_id_fk";

alter table "public"."product_tags" drop constraint "product_tags_product_id_products_id_fk";

alter table "public"."products" drop constraint "products_category_id_categories_id_fk";

alter table "public"."products" drop constraint "products_cover_image_id_images_id_fk";

alter table "public"."products" drop constraint "products_sku_unique";

alter table "public"."products" drop constraint "products_slug_unique";

alter table "public"."categories" drop constraint "categories_pkey";

alter table "public"."product_images" drop constraint "product_images_pkey";

alter table "public"."product_tags" drop constraint "product_tags_pkey";

alter table "public"."products" drop constraint "products_pkey";

drop index if exists "public"."categories_name_unique";

drop index if exists "public"."categories_pkey";

drop index if exists "public"."categories_slug_unique";

drop index if exists "public"."product_images_pkey";

drop index if exists "public"."product_tags_pkey";

drop index if exists "public"."products_pkey";

drop index if exists "public"."products_sku_unique";

drop index if exists "public"."products_slug_unique";

drop table "public"."categories";

drop table "public"."product_images";

drop table "public"."product_tags";

drop table "public"."products";

drop sequence if exists "public"."categories_id_seq";

drop sequence if exists "public"."product_images_id_seq";

drop sequence if exists "public"."product_tags_id_seq";

drop sequence if exists "public"."products_id_seq";


