import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { categories, images, imageTags, productTags } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	try {
		// Load categories
		const allCategories = await db
			.select()
			.from(categories)
			.orderBy(desc(categories.createdAt));

		// Load images with tags
		const allImages = await db
			.select({
				id: images.id,
				imageUrl: images.imageUrl,
				thumbUrl: images.thumbUrl,
				filename: images.filename,
				title: images.title,
				description: images.description,
				size: images.size,
				createdAt: images.createdAt,
				updatedAt: images.updatedAt
			})
			.from(images)
			.orderBy(desc(images.createdAt));

		// Load image tags for each image
		const imageTagsData = await db
			.select({
				imageId: imageTags.imageId,
				tagName: imageTags.tagName
			})
			.from(imageTags);

		// Group tags by image ID
		const tagsByImageId = imageTagsData.reduce(
			(acc, tag) => {
				if (!acc[tag.imageId]) {
					acc[tag.imageId] = [];
				}
				acc[tag.imageId].push(tag.tagName);
				return acc;
			},
			{} as Record<number, string[]>
		);

		// Combine images with their tags
		const imagesWithTags = allImages.map((image) => ({
			...image,
			tags: tagsByImageId[image.id] || []
		}));

		// Get unique product tags (not image tags)
		const productTagsData = await db.select({ tagName: productTags.tagName }).from(productTags);

		const allTags = [...new Set(productTagsData.map((tag) => tag.tagName))].sort();

		return {
			categories: allCategories,
			images: imagesWithTags,
			availableTags: allTags
		};
	} catch (error) {
		console.error('Error loading data:', error);
		return {
			categories: [],
			images: [],
			availableTags: []
		};
	}
};
