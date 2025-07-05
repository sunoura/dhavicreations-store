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
	tags: many(imageTags)
}));

export const imageTagsRelations = relations(imageTags, ({ one }) => ({
	image: one(images, {
		fields: [imageTags.imageId],
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
