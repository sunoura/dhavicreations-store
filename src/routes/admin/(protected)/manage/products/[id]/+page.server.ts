import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import {
	products,
	categories,
	images,
	imageTags,
	productTags,
	productImages
} from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const productId = parseInt(params.id);

	if (isNaN(productId)) {
		throw error(404, 'Product not found');
	}

	try {
		// Load product with category
		const product = await db
			.select({
				id: products.id,
				title: products.title,
				slug: products.slug,
				categoryId: products.categoryId,
				description: products.description,
				price: products.price,
				sku: products.sku,
				stock: products.stock,
				coverImageId: products.coverImageId,
				isActive: products.isActive,
				archivedAt: products.archivedAt,
				createdAt: products.createdAt,
				updatedAt: products.updatedAt,
				categoryName: categories.name
			})
			.from(products)
			.leftJoin(categories, eq(products.categoryId, categories.id))
			.where(eq(products.id, productId))
			.limit(1);

		if (product.length === 0) {
			throw error(404, 'Product not found');
		}

		const productData = product[0];

		// Load product tags
		const productTagsData = await db
			.select({ tagName: productTags.tagName })
			.from(productTags)
			.where(eq(productTags.productId, productId));

		// Load product images
		const productImagesData = await db
			.select({
				id: images.id,
				imageUrl: images.imageUrl,
				thumbUrl: images.thumbUrl,
				filename: images.filename,
				sortOrder: productImages.sortOrder
			})
			.from(productImages)
			.leftJoin(images, eq(productImages.imageId, images.id))
			.where(eq(productImages.productId, productId))
			.orderBy(productImages.sortOrder);

		// Load categories
		const allCategories = await db
			.select()
			.from(categories)
			.orderBy(desc(categories.createdAt));

		// Load all images with tags
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
		const allProductTagsData = await db
			.select({ tagName: productTags.tagName })
			.from(productTags);
		const allTags = [...new Set(allProductTagsData.map((tag) => tag.tagName))].sort();

		return {
			product: {
				...productData,
				tags: productTagsData.map((pt) => pt.tagName),
				images: productImagesData
			},
			categories: allCategories,
			images: imagesWithTags,
			availableTags: allTags
		};
	} catch (err) {
		console.error('Error loading product:', err);
		throw error(500, 'Failed to load product');
	}
};
