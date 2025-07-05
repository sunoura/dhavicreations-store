import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { categories } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';

export const GET: RequestHandler = async () => {
	try {
		const allCategories = await db
			.select()
			.from(categories)
			.orderBy(desc(categories.createdAt));

		return json(allCategories);
	} catch (error) {
		console.error('Error fetching categories:', error);
		return json({ error: 'Failed to fetch categories' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const slug = formData.get('slug') as string;
		const description = formData.get('description') as string;

		if (!name || !slug) {
			return json({ error: 'Name and slug are required' }, { status: 400 });
		}

		// Check if slug already exists
		const existingCategory = await db
			.select({ id: categories.id })
			.from(categories)
			.where(eq(categories.slug, slug))
			.limit(1);

		if (existingCategory.length > 0) {
			return json({ error: 'Category with this slug already exists' }, { status: 400 });
		}

		// Insert category
		const [newCategory] = await db
			.insert(categories)
			.values({
				name,
				slug,
				description: description || null
			})
			.returning();

		return json(newCategory, { status: 201 });
	} catch (error) {
		console.error('Error creating category:', error);
		return json({ error: 'Failed to create category' }, { status: 500 });
	}
};
