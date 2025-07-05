import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { productTags } from '$lib/server/db/schema';

export const GET: RequestHandler = async () => {
	try {
		// Get all unique product tags
		const allTags = await db
			.select({
				tagName: productTags.tagName
			})
			.from(productTags)
			.groupBy(productTags.tagName)
			.orderBy(productTags.tagName);

		const tags = allTags.map((tag) => tag.tagName);

		return json(tags);
	} catch (error) {
		console.error('Error fetching product tags:', error);
		return json({ error: 'Failed to fetch product tags' }, { status: 500 });
	}
};
