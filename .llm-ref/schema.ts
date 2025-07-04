import {
    pgTable,
    serial,
    text,
    integer,
    decimal,
    boolean,
    timestamp,
    pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const storeTypeEnum = pgEnum("store_type", [
    "wearables",
    "stationery",
    "designs",
]);
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const formTypeEnum = pgEnum("form_type", ["buy_now", "call_back"]);
export const contactMethodEnum = pgEnum("contact_method", ["whatsapp", "phone"]);

export const user = pgTable("user", {
    id: text("id").primaryKey(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    phone: text("phone").unique(),
    address: text("address"),
    city: text("city"),
    state: text("state"),
    pincode: text("pincode"),
    country: text("country"),
    role: userRoleEnum("role").default("user").notNull(),
    createdAt: timestamp("created_at", {
        withTimezone: true,
        mode: "date",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
        withTimezone: true,
        mode: "date",
    }),
});

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id),
    expiresAt: timestamp("expires_at", {
        withTimezone: true,
        mode: "date",
    }).notNull(),
});

// Categories table
export const categories = pgTable("categories", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tags table
export const tags = pgTable("tags", {
    id: serial("id").primaryKey(),
    title: text("title").notNull().unique(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Albums table
export const albums = pgTable("albums", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    coverImageId: integer("cover_image_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Images table - Updated to support standalone images and albums
export const images = pgTable("images", {
    id: serial("id").primaryKey(),
    productId: integer("product_id"), // Made optional for standalone images
    albumId: integer("album_id"), // Album relationship
    imageUrl: text("image_url").notNull(),
    thumbUrl: text("thumb_url").notNull(),
    filename: text("filename").notNull(), // Added filename field
    title: text("title"),
    description: text("description"), // Added description field
    size: integer("size"), // in bytes
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Products table
export const products = pgTable("products", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    categoryId: integer("category_id").notNull(),
    storeType: storeTypeEnum("store_type").notNull(),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    sku: text("sku").unique(),
    stock: integer("stock").default(0).notNull(),
    coverImageId: integer("cover_image_id"),
    dimensions: text("dimensions"),
    weightGrams: integer("weight_grams"),
    isActive: boolean("is_active").default(true).notNull(),
    archivedAt: timestamp("archived_at"),
    isDigital: boolean("is_digital").default(false).notNull(),
    fileUrl: text("file_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Junction table for many-to-many relationship between products and tags
export const productTags = pgTable("product_tags", {
    id: serial("id").primaryKey(),
    productId: integer("product_id").notNull(),
    tagId: integer("tag_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Junction table for many-to-many relationship between images and tags
export const imageTags = pgTable("image_tags", {
    id: serial("id").primaryKey(),
    imageId: integer("image_id").notNull(),
    tagId: integer("tag_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Form submissions table
export const formSubmissions = pgTable("form_submissions", {
    id: serial("id").primaryKey(),
    type: formTypeEnum("type").notNull(),
    
    // Common fields for both forms
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    
    // Buy Now form specific fields
    pincode: text("pincode"), // Required for buy_now
    contactMethod: contactMethodEnum("contact_method"), // Required for buy_now
    agreedToContact: boolean("agreed_to_contact").default(false), // Required for buy_now
    callIfNoWhatsapp: boolean("call_if_no_whatsapp").default(false), // Optional for buy_now
    
    // Call Back form specific fields
    message: text("message"), // Optional for call_back
    source: text("source"), // Required for call_back (page source)
    
    // Admin fields
    isRead: boolean("is_read").default(false).notNull(),
    readAt: timestamp("read_at"),
    readBy: text("read_by"), // User ID who marked as read
    notes: text("notes"), // Admin notes
    
    // Security/tracking
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
    products: many(products),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
    productTags: many(productTags),
    imageTags: many(imageTags),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
    category: one(categories, {
        fields: [products.categoryId],
        references: [categories.id],
    }),
    coverImage: one(images, {
        fields: [products.coverImageId],
        references: [images.id],
    }),
    images: many(images),
    productTags: many(productTags),
}));

export const albumsRelations = relations(albums, ({ one, many }) => ({
    coverImage: one(images, {
        fields: [albums.coverImageId],
        references: [images.id],
    }),
    images: many(images),
}));

export const imagesRelations = relations(images, ({ one, many }) => ({
    product: one(products, {
        fields: [images.productId],
        references: [products.id],
    }),
    album: one(albums, {
        fields: [images.albumId],
        references: [albums.id],
    }),
    imageTags: many(imageTags),
}));

export const productTagsRelations = relations(productTags, ({ one }) => ({
    product: one(products, {
        fields: [productTags.productId],
        references: [products.id],
    }),
    tag: one(tags, {
        fields: [productTags.tagId],
        references: [tags.id],
    }),
}));

export const imageTagsRelations = relations(imageTags, ({ one }) => ({
    image: one(images, {
        fields: [imageTags.imageId],
        references: [images.id],
    }),
    tag: one(tags, {
        fields: [imageTags.tagId],
        references: [tags.id],
    }),
}));

export const formSubmissionsRelations = relations(formSubmissions, ({ one }) => ({
    readByUser: one(user, {
        fields: [formSubmissions.readBy],
        references: [user.id],
    }),
}));

// Types
export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type Album = typeof albums.$inferSelect;
export type NewAlbum = typeof albums.$inferInsert;
export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;
export type ProductTag = typeof productTags.$inferSelect;
export type NewProductTag = typeof productTags.$inferInsert;
export type ImageTag = typeof imageTags.$inferSelect;
export type NewImageTag = typeof imageTags.$inferInsert;
export type FormSubmission = typeof formSubmissions.$inferSelect;
export type NewFormSubmission = typeof formSubmissions.$inferInsert;

// Extended types with relations
export type ProductWithRelations = Product & {
    category: Category;
    coverImage?: Image;
    images: Image[];
    productTags: (ProductTag & { tag: Tag })[];
};

export type ProductWithBasicRelations = Product & {
    category: Category;
    coverImage?: Image;
};

export type AlbumWithImages = Album & {
    coverImage?: Image;
    images: Image[];
};

export type ImageWithTags = Image & {
    imageTags: (ImageTag & { tag: Tag })[];
    product?: Product;
    album?: Album;
};

export type FormSubmissionWithUser = FormSubmission & {
    readByUser?: User;
};

