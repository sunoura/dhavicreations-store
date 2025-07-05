import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { imageTags } from '$lib/server/db/schema';

export const GET: RequestHandler = async () => {
	try {
		// Get all unique image tags
		const allTags = await db
			.select({
				tagName: imageTags.tagName
			})
			.from(imageTags)
			.groupBy(imageTags.tagName)
			.orderBy(imageTags.tagName);

		const tags = allTags.map((tag) => tag.tagName);

		return json(tags);
	} catch (error) {
		console.error('Error fetching image tags:', error);
		return json({ error: 'Failed to fetch image tags' }, { status: 500 });
	}
};
