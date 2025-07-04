import { pgTable, serial, integer, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from "drizzle-orm";

export const admin = pgTable('admin', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    email: text('email').notNull().unique(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    isActive: boolean('is_active').default(true).notNull(),
	createdAt: timestamp('created_at', {
        withTimezone: true,
        mode: "date",
    }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', {
        withTimezone: true,
        mode: "date",
    }).notNull().defaultNow()
});

export const adminSession = pgTable("admin_session", {
    id: text("id").primaryKey(),
    adminId: text("admin_id")
        .notNull()
        .references(() => admin.id),
    expiresAt: timestamp("expires_at", {
        withTimezone: true,
        mode: "date",
    }).notNull(),
});

// Relations
export const adminRelations = relations(admin, ({ many }) => ({
    sessions: many(adminSession),
}));

export const adminSessionRelations = relations(adminSession, ({ one }) => ({
    admin: one(admin, {
        fields: [adminSession.adminId],
        references: [admin.id],
    }),
}));

// Types
export type Admin = typeof admin.$inferSelect;
export type NewAdmin = typeof admin.$inferInsert;
export type AdminSession = typeof adminSession.$inferSelect;
export type NewAdminSession = typeof adminSession.$inferInsert;