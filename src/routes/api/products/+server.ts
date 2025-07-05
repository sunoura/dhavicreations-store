import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { products, categories, productTags, productImages, images } from '$lib/server/db/schema';
import { eq, desc, isNull } from 'drizzle-orm';

export const GET: RequestHandler = async () => {
	try {
		const allProducts = await db
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
				category: {
					id: categories.id,
					name: categories.name,
					slug: categories.slug
				}
			})
			.from(products)
			.leftJoin(categories, eq(products.categoryId, categories.id))
			.where(isNull(products.archivedAt)) // Only non-archived products
			.orderBy(desc(products.createdAt));

		// Get tags and images for each product
		const productsWithRelations = await Promise.all(
			allProducts.map(async (product) => {
				// Get tags
				const productTagsResult = await db
					.select({ tagName: productTags.tagName })
					.from(productTags)
					.where(eq(productTags.productId, product.id));

				// Get images
				const productImagesResult = await db
					.select({
						id: images.id,
						imageUrl: images.imageUrl,
						thumbUrl: images.thumbUrl,
						filename: images.filename,
						sortOrder: productImages.sortOrder
					})
					.from(productImages)
					.leftJoin(images, eq(productImages.imageId, images.id))
					.where(eq(productImages.productId, product.id))
					.orderBy(productImages.sortOrder);

				return {
					...product,
					tags: productTagsResult.map((tag) => tag.tagName),
					images: productImagesResult
				};
			})
		);

		return json(productsWithRelations);
	} catch (error) {
		console.error('Error fetching products:', error);
		return json({ error: 'Failed to fetch products' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const title = formData.get('title') as string;
		const slug = formData.get('slug') as string;
		const categoryId = parseInt(formData.get('categoryId') as string);
		const description = formData.get('description') as string;
		const price = parseInt(formData.get('price') as string);
		const sku = formData.get('sku') as string;
		const stock = parseInt(formData.get('stock') as string);
		const tags = formData.get('tags') as string;
		const imageIds = formData.get('imageIds') as string;
		const coverImageId = formData.get('coverImageId') as string;

		if (!title || !slug || !categoryId || !sku) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Check if slug already exists
		const existingProduct = await db
			.select({ id: products.id })
			.from(products)
			.where(eq(products.slug, slug))
			.limit(1);

		if (existingProduct.length > 0) {
			return json({ error: 'Product with this slug already exists' }, { status: 400 });
		}

		// Insert product
		const [newProduct] = await db
			.insert(products)
			.values({
				title,
				slug,
				categoryId,
				description: description || null,
				price: price * 100, // Convert to paise
				sku,
				stock: stock || 0,
				coverImageId: coverImageId ? parseInt(coverImageId) : null
			})
			.returning();

		// Handle tags
		if (tags) {
			const tagArray = tags
				.split(',')
				.map((tag) => tag.trim())
				.filter((tag) => tag.length > 0);

			if (tagArray.length > 0) {
				const tagValues = tagArray.map((tagName) => ({
					productId: newProduct.id,
					tagName
				}));

				await db.insert(productTags).values(tagValues);
			}
		}

		// Handle images
		if (imageIds) {
			const imageIdArray = imageIds
				.split(',')
				.map((id) => parseInt(id.trim()))
				.filter((id) => !isNaN(id));

			if (imageIdArray.length > 0) {
				const imageValues = imageIdArray.map((imageId, index) => ({
					productId: newProduct.id,
					imageId,
					sortOrder: index
				}));

				await db.insert(productImages).values(imageValues);
			}
		}

		return json(newProduct, { status: 201 });
	} catch (error) {
		console.error('Error creating product:', error);
		return json({ error: 'Failed to create product' }, { status: 500 });
	}
};
