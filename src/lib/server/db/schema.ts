import {
	pgTable,
	serial,
	integer,
	text,
	timestamp,
	boolean,
	varchar,
	bigint
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const admin = pgTable('admin', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	email: text('email').notNull().unique(),
	firstName: text('first_name'),
	lastName: text('last_name'),
	isActive: boolean('is_active').default(true).notNull(),
	createdAt: timestamp('created_at', {
		withTimezone: true,
		mode: 'date'
	})
		.notNull()
		.defaultNow(),
	updatedAt: timestamp('updated_at', {
		withTimezone: true,
		mode: 'date'
	})
		.notNull()
		.defaultNow()
});

export const adminSession = pgTable('admin_session', {
	id: text('id').primaryKey(),
	adminId: text('admin_id')
		.notNull()
		.references(() => admin.id),
	expiresAt: timestamp('expires_at', {
		withTimezone: true,
		mode: 'date'
	}).notNull()
});

export const images = pgTable('images', {
	id: serial('id').primaryKey(),
	imageUrl: text('image_url').notNull(),
	thumbUrl: text('thumb_url').notNull(),
	filename: text('filename').notNull(),
	title: text('title'),
	description: text('description'),
	size: bigint('size', { mode: 'number' }).notNull(),
	createdAt: timestamp('created_at', {
		withTimezone: true,
		mode: 'date'
	})
		.notNull()
		.defaultNow(),
	updatedAt: timestamp('updated_at', {
		withTimezone: true,
		mode: 'date'
	})
		.notNull()
		.defaultNow()
});

export const imageTags = pgTable('image_tags', {
	id: serial('id').primaryKey(),
	imageId: integer('image_id')
		.notNull()
		.references(() => images.id, { onDelete: 'cascade' }),
	tagName: varchar('tag_name', { length: 100 }).notNull(),
	createdAt: timestamp('created_at', {
		withTimezone: true,
		mode: 'date'
	})
		.notNull()
		.defaultNow()
});

// Categories table
export const categories = pgTable('categories', {
	id: serial('id').primaryKey(),
	name: text('name').notNull().unique(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	isActive: boolean('is_active').default(true).notNull(),
	createdAt: timestamp('created_at', {
		withTimezone: true,
		mode: 'date'
	})
		.notNull()
		.defaultNow(),
	updatedAt: timestamp('updated_at', {
		withTimezone: true,
		mode: 'date'
	})
		.notNull()
		.defaultNow()
});

// Products table
export const products = pgTable('products', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	slug: text('slug').notNull().unique(),
	categoryId: integer('category_id')
		.notNull()
		.references(() => categories.id, { onDelete: 'restrict' }),
	description: text('description'),
	price: integer('price').notNull(), // Price in paise (₹1 = 100 paise)
	sku: text('sku').notNull().unique(),
	stock: integer('stock').notNull().default(0),
	coverImageId: integer('cover_image_id').references(() => images.id, { onDelete: 'set null' }),
	isActive: boolean('is_active').default(true).notNull(),
	archivedAt: timestamp('archived_at', {
		withTimezone: true,
		mode: 'date'
	}),
	createdAt: timestamp('created_at', {
		withTimezone: true,
		mode: 'date'
	})
		.notNull()
		.defaultNow(),
	updatedAt: timestamp('updated_at', {
		withTimezone: true,
		mode: 'date'
	})
		.notNull()
		.defaultNow()
});

// Product tags table (many-to-many)
export const productTags = pgTable('product_tags', {
	id: serial('id').primaryKey(),
	productId: integer('product_id')
		.notNull()
		.references(() => products.id, { onDelete: 'cascade' }),
	tagName: varchar('tag_name', { length: 100 }).notNull(),
	createdAt: timestamp('created_at', {
		withTimezone: true,
		mode: 'date'
	})
		.notNull()
		.defaultNow()
});

// Product images table (many-to-many)
export const productImages = pgTable('product_images', {
	id: serial('id').primaryKey(),
	productId: integer('product_id')
		.notNull()
		.references(() => products.id, { onDelete: 'cascade' }),
	imageId: integer('image_id')
		.notNull()
		.references(() => images.id, { onDelete: 'cascade' }),
	sortOrder: integer('sort_order').notNull().default(0),
	createdAt: timestamp('created_at', {
		withTimezone: true,
		mode: 'date'
	})
		.notNull()
		.defaultNow()
});

// Relations
export const adminRelations = relations(admin, ({ many }) => ({
	sessions: many(adminSession)
}));

export const adminSessionRelations = relations(adminSession, ({ one }) => ({
	admin: one(admin, {
		fields: [adminSession.adminId],
		references: [admin.id]
	})
}));

export const imagesRelations = relations(images, ({ many }) => ({
	tags: many(imageTags),
	productImages: many(productImages)
}));

export const imageTagsRelations = relations(imageTags, ({ one }) => ({
	image: one(images, {
		fields: [imageTags.imageId],
		references: [images.id]
	})
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
	products: many(products)
}));

export const productsRelations = relations(products, ({ one, many }) => ({
	category: one(categories, {
		fields: [products.categoryId],
		references: [categories.id]
	}),
	coverImage: one(images, {
		fields: [products.coverImageId],
		references: [images.id]
	}),
	tags: many(productTags),
	images: many(productImages)
}));

export const productTagsRelations = relations(productTags, ({ one }) => ({
	product: one(products, {
		fields: [productTags.productId],
		references: [products.id]
	})
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
	product: one(products, {
		fields: [productImages.productId],
		references: [products.id]
	}),
	image: one(images, {
		fields: [productImages.imageId],
		references: [images.id]
	})
}));

// Types
export type Admin = typeof admin.$inferSelect;
export type NewAdmin = typeof admin.$inferInsert;

export type AdminSession = typeof adminSession.$inferSelect;
export type NewAdminSession = typeof adminSession.$inferInsert;

export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;
export type ImageTag = typeof imageTags.$inferSelect;
export type NewImageTag = typeof imageTags.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductTag = typeof productTags.$inferSelect;
export type NewProductTag = typeof productTags.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;
