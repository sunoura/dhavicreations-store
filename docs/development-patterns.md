# Development Patterns & Architecture Guide

This document outlines the established patterns, code style, and architecture used in the DC0.5 project. Use this as a reference for implementing future features and maintaining consistency.

## 🏗️ **Project Architecture**

### **Technology Stack**

- **Frontend**: Svelte 5 with SvelteKit
- **Backend**: SvelteKit API routes
- **Database**: PostgreSQL with Drizzle ORM
- **Storage**: Vercel Blob for file storage
- **Styling**: Tailwind CSS with shadcn-svelte components
- **Package Manager**: pnpm
- **Language**: TypeScript

### **Directory Structure**

```
src/
├── lib/
│   ├── components/ui/          # shadcn-svelte UI components
│   ├── server/                 # Server-side utilities
│   │   ├── db/                # Database schema and connection
│   │   ├── auth.ts            # Authentication utilities
│   │   ├── security.ts        # Security configurations
│   │   └── [service].ts       # Service-specific utilities
│   └── stores/                # Svelte 5 state management
├── routes/
│   ├── api/                   # API endpoints
│   │   └── [resource]/
│   │       ├── +server.ts     # List/Create operations
│   │       └── [id]/
│   │           └── +server.ts # Read/Update/Delete operations
│   └── admin/(protected)/     # Protected admin routes
│       └── manage/[resource]/
│           ├── +page.svelte   # List/Grid view
│           ├── create/
│           │   └── +page.svelte # Create form
│           └── [id]/
│               └── edit/
│                   └── +page.svelte # Edit form
```

## 🎨 **Code Style & Patterns**

### **Svelte 5 State Management**

```typescript
// Use $state for reactive variables
let data = $state<DataType[]>([]);
let isLoading = $state(false);
let error = $state<string | null>(null);

// Use $effect for side effects
$effect(() => {
	loadData();
});

// Use $props for component props
let { prop } = $props();
```

### **Component Structure**

```svelte
<script lang="ts">
	// 1. Imports
	import { Component } from '$lib/components/ui/component';
	import { toast } from 'svelte-sonner';

	// 2. State variables
	let data = $state<DataType[]>([]);
	let isLoading = $state(false);

	// 3. Functions
	async function loadData() {
		// Implementation
	}

	// 4. Effects
	$effect(() => {
		loadData();
	});
</script>

<!-- 5. Template -->
<div class="container">
	<!-- Content -->
</div>
```

### **API Route Patterns**

#### **List/Create Endpoint** (`/api/[resource]/+server.ts`)

```typescript
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { resourceTable } from '$lib/server/db/schema';

export const GET: RequestHandler = async () => {
	try {
		const items = await db.select().from(resourceTable).orderBy(desc(resourceTable.createdAt));

		return json(items);
	} catch (error) {
		console.error('Error fetching items:', error);
		return json({ error: 'Failed to fetch items' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		// Process form data
		// Insert into database
		return json(newItem, { status: 201 });
	} catch (error) {
		console.error('Error creating item:', error);
		return json({ error: 'Failed to create item' }, { status: 500 });
	}
};
```

#### **Single Item Endpoint** (`/api/[resource]/[id]/+server.ts`)

```typescript
export const GET: RequestHandler = async ({ params }) => {
	try {
		const item = await db
			.select()
			.from(resourceTable)
			.where(eq(resourceTable.id, parseInt(params.id)))
			.limit(1);

		if (item.length === 0) {
			return json({ error: 'Item not found' }, { status: 404 });
		}

		return json(item[0]);
	} catch (error) {
		console.error('Error fetching item:', error);
		return json({ error: 'Failed to fetch item' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	// Full update (including file replacement)
};

export const PATCH: RequestHandler = async ({ params, request }) => {
	// Partial update (metadata only)
};

export const DELETE: RequestHandler = async ({ params }) => {
	// Delete item and associated files
};
```

### **Database Schema Patterns**

```typescript
// Main resource table
export const resourceTable = pgTable('resource', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	fileUrl: text('file_url').notNull(),
	thumbUrl: text('thumb_url').notNull(),
	filename: text('filename').notNull(),
	size: bigint('size', { mode: 'number' }).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

// Related tags table (many-to-many)
export const resourceTags = pgTable('resource_tags', {
	id: serial('id').primaryKey(),
	resourceId: integer('resource_id')
		.notNull()
		.references(() => resourceTable.id, { onDelete: 'cascade' }),
	tagName: varchar('tag_name', { length: 100 }).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

// Relations
export const resourceRelations = relations(resourceTable, ({ many }) => ({
	tags: many(resourceTags)
}));
```

## 🎯 **Feature Implementation Patterns**

### **1. CRUD Operations Pattern**

#### **List/Grid Page** (`/admin/manage/[resource]/+page.svelte`)

- Load data on mount
- Display in grid/list format
- Search and filter functionality
- Action buttons (edit, delete, etc.)
- Toast notifications for user feedback

#### **Create Page** (`/admin/manage/[resource]/create/+page.svelte`)

- Form with validation
- File upload handling
- Tag selection/creation
- Success/error notifications
- Redirect to list page on success

#### **Edit Page** (`/admin/manage/[resource]/[id]/edit/+page.svelte`)

- Load existing data
- Form pre-populated with current values
- File replacement option
- Tag management
- Update/delete actions

### **2. File Upload Pattern**

```typescript
// Server-side file handling
const uploadResult = await uploadFile(file, uniqueFilename);
const thumbnailBuffer = await generateThumbnailFromFile(file, options);
const thumbnailResult = await uploadThumbnail(thumbnailBuffer, uniqueFilename);

// Database insertion
const [newItem] = await db
	.insert(resourceTable)
	.values({
		fileUrl: uploadResult.url,
		thumbUrl: thumbnailResult.url,
		filename: uniqueFilename
		// ... other fields
	})
	.returning();
```

### **3. Tag Management Pattern**

```typescript
// API endpoint for tags
export const GET: RequestHandler = async () => {
	const allTags = await db
		.select({ tagName: resourceTags.tagName })
		.from(resourceTags)
		.groupBy(resourceTags.tagName)
		.orderBy(resourceTags.tagName);

	return json(allTags.map((tag) => tag.tagName));
};

// Frontend tag handling
let availableTags = $state<string[]>([]);
let selectedTags = $state<string[]>([]);

function toggleTag(tag: string) {
	if (selectedTags.includes(tag)) {
		selectedTags = selectedTags.filter((t) => t !== tag);
	} else {
		selectedTags = [...selectedTags, tag];
	}
}
```

### **4. Search & Filter Pattern**

```typescript
let searchQuery = $state('');
let selectedFilters = $state<string[]>([]);
let allItems = $state<ItemType[]>([]);
let filteredItems = $state<ItemType[]>([]);

function filterItems() {
	let filtered = allItems;

	// Text search
	if (searchQuery.trim()) {
		const query = searchQuery.toLowerCase();
		filtered = filtered.filter(
			(item) =>
				item.name.toLowerCase().includes(query) ||
				item.description?.toLowerCase().includes(query)
		);
	}

	// Tag filtering
	if (selectedFilters.length > 0) {
		filtered = filtered.filter(
			(item) => item.tags && selectedFilters.some((tag) => item.tags!.includes(tag))
		);
	}

	filteredItems = filtered;
}
```

## 🔧 **Utility Patterns**

### **Error Handling**

```typescript
try {
	// Operation
	return json(result);
} catch (error) {
	console.error('Error description:', error);
	return json({ error: 'User-friendly error message' }, { status: 500 });
}
```

### **Toast Notifications**

```typescript
import { toast } from 'svelte-sonner';

// Success
toast.success('Operation completed successfully!');

// Error
toast.error('Operation failed');

// Info
toast.info('Information message');
```

### **Form Validation**

```typescript
if (!requiredField.trim()) {
	error = 'Field is required';
	toast.error('Field is required');
	return;
}
```

### **File Cleanup**

```typescript
$effect(() => {
	return () => {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}
	};
});
```

## 📁 **File Organization**

### **Server-Side Services**

- Place in `src/lib/server/`
- Separate concerns (auth, db, file handling, etc.)
- Use descriptive names: `vercel-blob.ts`, `image-utils.ts`

### **API Routes**

- Follow RESTful conventions
- Use proper HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Include proper error handling and status codes

### **Database**

- Use Drizzle ORM for type safety
- Define relations properly
- Use migrations for schema changes
- Include proper indexes and constraints

### **Components**

- Use shadcn-svelte components for consistency
- Create reusable components in `src/lib/components/`
- Follow Svelte 5 patterns with `$state` and `$effect`

## 🚀 **Deployment Considerations**

### **Environment Variables**

- Database connection strings
- Vercel Blob credentials
- Authentication secrets

### **Security**

- Content Security Policy (CSP)
- Input validation
- File type restrictions
- Authentication middleware

### **Performance**

- Image optimization and thumbnails
- Lazy loading for grids
- Efficient database queries
- Proper indexing

## 📝 **Best Practices**

1. **Type Safety**: Use TypeScript throughout
2. **Error Handling**: Always include try-catch blocks
3. **User Feedback**: Use toast notifications for all operations
4. **Loading States**: Show loading indicators during async operations
5. **Validation**: Validate inputs on both client and server
6. **File Management**: Clean up temporary files and URLs
7. **Database**: Use transactions for multi-step operations
8. **Security**: Validate file types and sizes
9. **Accessibility**: Use proper ARIA labels and keyboard navigation
10. **Responsive Design**: Ensure mobile-friendly interfaces

## 🔄 **Migration Patterns**

When adding new features:

1. Create database schema and migrations
2. Add API endpoints following the established pattern
3. Create admin pages (list, create, edit)
4. Add search and filter functionality
5. Implement file upload handling if needed
6. Add tag management if applicable
7. Test all CRUD operations
8. Add proper error handling and notifications

This pattern ensures consistency and maintainability across all features in the application.
