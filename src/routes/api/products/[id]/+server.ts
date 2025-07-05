import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { products, categories, productTags, productImages, images } from '$lib/server/db/schema';
import { eq, and, isNull } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const productId = parseInt(params.id);

		if (isNaN(productId)) {
			return json({ error: 'Invalid product ID' }, { status: 400 });
		}

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
				category: {
					id: categories.id,
					name: categories.name,
					slug: categories.slug
				}
			})
			.from(products)
			.leftJoin(categories, eq(products.categoryId, categories.id))
			.where(eq(products.id, productId))
			.limit(1);

		if (product.length === 0) {
			return json({ error: 'Product not found' }, { status: 404 });
		}

		// Get tags
		const tags = await db
			.select({ tagName: productTags.tagName })
			.from(productTags)
			.where(eq(productTags.productId, productId));

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
			.where(eq(productImages.productId, productId))
			.orderBy(productImages.sortOrder);

		const productWithRelations = {
			...product[0],
			tags: tags.map((tag) => tag.tagName),
			images: productImagesResult
		};

		return json(productWithRelations);
	} catch (error) {
		console.error('Error fetching product:', error);
		return json({ error: 'Failed to fetch product' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const productId = parseInt(params.id);

		if (isNaN(productId)) {
			return json({ error: 'Invalid product ID' }, { status: 400 });
		}

		// Check if product exists
		const existingProduct = await db
			.select({ id: products.id })
			.from(products)
			.where(eq(products.id, productId))
			.limit(1);

		if (existingProduct.length === 0) {
			return json({ error: 'Product not found' }, { status: 404 });
		}

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

		// Check for price overflow (price in paise must fit in PostgreSQL integer)
		const priceInPaise = price * 100;
		if (priceInPaise > 2147483647) {
			return json(
				{
					error: 'Price is too high. Maximum allowed price is ₹21,474,836.47'
				},
				{ status: 400 }
			);
		}

		// Check if slug already exists (excluding current product)
		const existingSlug = await db
			.select({ id: products.id })
			.from(products)
			.where(and(eq(products.slug, slug), eq(products.id, productId)))
			.limit(1);

		if (existingSlug.length === 0) {
			// Check if slug is used by another product
			const slugConflict = await db
				.select({ id: products.id })
				.from(products)
				.where(eq(products.slug, slug))
				.limit(1);

			if (slugConflict.length > 0) {
				return json({ error: 'Product with this slug already exists' }, { status: 400 });
			}
		}

		// Update product
		const [updatedProduct] = await db
			.update(products)
			.set({
				title,
				slug,
				categoryId,
				description: description || null,
				price: price * 100, // Convert to paise
				sku,
				stock: stock || 0,
				coverImageId: coverImageId ? parseInt(coverImageId) : null,
				updatedAt: new Date()
			})
			.where(eq(products.id, productId))
			.returning();

		// Update tags
		await db.delete(productTags).where(eq(productTags.productId, productId));
		if (tags) {
			const tagArray = tags
				.split(',')
				.map((tag) => tag.trim())
				.filter((tag) => tag.length > 0);

			if (tagArray.length > 0) {
				const tagValues = tagArray.map((tagName) => ({
					productId,
					tagName
				}));

				await db.insert(productTags).values(tagValues);
			}
		}

		// Update images
		await db.delete(productImages).where(eq(productImages.productId, productId));
		if (imageIds) {
			const imageIdArray = imageIds
				.split(',')
				.map((id) => parseInt(id.trim()))
				.filter((id) => !isNaN(id));

			if (imageIdArray.length > 0) {
				const imageValues = imageIdArray.map((imageId, index) => ({
					productId,
					imageId,
					sortOrder: index
				}));

				await db.insert(productImages).values(imageValues);
			}
		}

		return json(updatedProduct);
	} catch (error) {
		console.error('Error updating product:', error);
		return json({ error: 'Failed to update product' }, { status: 500 });
	}
};

export const PATCH: RequestHandler = async ({ params, request }) => {
	try {
		const productId = parseInt(params.id);

		if (isNaN(productId)) {
			return json({ error: 'Invalid product ID' }, { status: 400 });
		}

		const body = await request.json();
		const updateData: any = { updatedAt: new Date() };

		// Only update provided fields
		if (body.title !== undefined) updateData.title = body.title;
		if (body.slug !== undefined) updateData.slug = body.slug;
		if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
		if (body.description !== undefined) updateData.description = body.description;
		if (body.price !== undefined) updateData.price = body.price * 100; // Convert to paise
		if (body.sku !== undefined) updateData.sku = body.sku;
		if (body.stock !== undefined) updateData.stock = body.stock;
		if (body.coverImageId !== undefined) updateData.coverImageId = body.coverImageId;
		if (body.isActive !== undefined) updateData.isActive = body.isActive;

		// Check if product exists
		const existingProduct = await db
			.select({ id: products.id })
			.from(products)
			.where(eq(products.id, productId))
			.limit(1);

		if (existingProduct.length === 0) {
			return json({ error: 'Product not found' }, { status: 404 });
		}

		// Update product
		const [updatedProduct] = await db
			.update(products)
			.set(updateData)
			.where(eq(products.id, productId))
			.returning();

		// Update tags if provided
		if (body.tags !== undefined) {
			await db.delete(productTags).where(eq(productTags.productId, productId));

			if (Array.isArray(body.tags) && body.tags.length > 0) {
				const tagValues = body.tags
					.map((tagName: string) => ({
						productId,
						tagName: String(tagName).trim()
					}))
					.filter((tag: any) => tag.tagName.length > 0);

				if (tagValues.length > 0) {
					await db.insert(productTags).values(tagValues);
				}
			}
		}

		return json(updatedProduct);
	} catch (error) {
		console.error('Error updating product:', error);
		return json({ error: 'Failed to update product' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const productId = parseInt(params.id);

		if (isNaN(productId)) {
			return json({ error: 'Invalid product ID' }, { status: 400 });
		}

		// Check if product exists
		const existingProduct = await db
			.select({ id: products.id })
			.from(products)
			.where(eq(products.id, productId))
			.limit(1);

		if (existingProduct.length === 0) {
			return json({ error: 'Product not found' }, { status: 404 });
		}

		// Soft delete by setting archivedAt
		await db
			.update(products)
			.set({
				archivedAt: new Date(),
				updatedAt: new Date()
			})
			.where(eq(products.id, productId));

		return json({ message: 'Product archived successfully' });
	} catch (error) {
		console.error('Error archiving product:', error);
		return json({ error: 'Failed to archive product' }, { status: 500 });
	}
};
