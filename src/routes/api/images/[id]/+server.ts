import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { images, imageTags } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { deleteImage } from '$lib/server/vercel-blob';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const imageId = parseInt(params.id);

		if (isNaN(imageId)) {
			return json({ error: 'Invalid image ID' }, { status: 400 });
		}

		const image = await db
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
			.where(eq(images.id, imageId))
			.limit(1);

		if (image.length === 0) {
			return json({ error: 'Image not found' }, { status: 404 });
		}

		// Get tags for this image
		const tags = await db
			.select({ tagName: imageTags.tagName })
			.from(imageTags)
			.where(eq(imageTags.imageId, imageId));

		const imageWithTags = {
			...image[0],
			tags: tags.map((tag) => tag.tagName)
		};

		return json(imageWithTags);
	} catch (error) {
		console.error('Error fetching image:', error);
		return json({ error: 'Failed to fetch image' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const imageId = parseInt(params.id);

		if (isNaN(imageId)) {
			return json({ error: 'Invalid image ID' }, { status: 400 });
		}

		// Check if image exists
		const existingImage = await db
			.select({ id: images.id, imageUrl: images.imageUrl, thumbUrl: images.thumbUrl })
			.from(images)
			.where(eq(images.id, imageId))
			.limit(1);

		if (existingImage.length === 0) {
			return json({ error: 'Image not found' }, { status: 404 });
		}

		const contentType = request.headers.get('content-type');

		if (contentType?.includes('multipart/form-data')) {
			// Handle file upload update
			const formData = await request.formData();
			const file = formData.get('file') as File;
			const title = formData.get('title') as string;
			const description = formData.get('description') as string;

			if (!file) {
				return json({ error: 'No file provided' }, { status: 400 });
			}

			// Import the required functions
			const { uploadImage, uploadThumbnail, generateUniqueFilename } = await import(
				'$lib/server/vercel-blob'
			);
			const { generateThumbnailFromFile } = await import('$lib/server/utils/image-utils');

			// Generate unique filename
			const uniqueFilename = generateUniqueFilename(file.name);

			// Upload new image to Vercel Blob
			const uploadResult = await uploadImage(file, uniqueFilename);

			// Generate and upload thumbnail
			let thumbnailUrl = uploadResult.url; // Fallback to original image
			try {
				const thumbnailBuffer = await generateThumbnailFromFile(file, {
					width: 300,
					height: 300,
					quality: 80,
					format: 'jpeg'
				});

				const thumbnailResult = await uploadThumbnail(thumbnailBuffer, uniqueFilename);
				thumbnailUrl = thumbnailResult.url;
			} catch (thumbnailError) {
				console.error('Failed to generate thumbnail:', thumbnailError);
				// Continue with original image as thumbnail
			}

			// Delete old files from blob storage
			try {
				const { deleteImage } = await import('$lib/server/vercel-blob');
				await deleteImage(existingImage[0].imageUrl);
				await deleteImage(existingImage[0].thumbUrl);
			} catch (deleteError) {
				console.error('Failed to delete old files:', deleteError);
				// Continue with update even if deletion fails
			}

			// Update database record
			const [updatedImage] = await db
				.update(images)
				.set({
					imageUrl: uploadResult.url,
					thumbUrl: thumbnailUrl,
					filename: uniqueFilename,
					title: title || null,
					description: description || null,
					size: uploadResult.size,
					updatedAt: new Date()
				})
				.where(eq(images.id, imageId))
				.returning();

			return json(updatedImage);
		} else {
			// Handle metadata-only update
			const body = await request.json();
			const { title, description, tags } = body;

			// Update image
			const [updatedImage] = await db
				.update(images)
				.set({
					title: title || null,
					description: description || null,
					updatedAt: new Date()
				})
				.where(eq(images.id, imageId))
				.returning();

			// Update tags if provided
			if (tags !== undefined) {
				// Delete existing tags
				await db.delete(imageTags).where(eq(imageTags.imageId, imageId));

				// Insert new tags
				if (Array.isArray(tags) && tags.length > 0) {
					const tagValues = tags
						.map((tagName: string) => ({
							imageId,
							tagName: String(tagName).trim()
						}))
						.filter((tag: { tagName: string }) => tag.tagName.length > 0);

					if (tagValues.length > 0) {
						await db.insert(imageTags).values(tagValues);
					}
				}
			}

			return json(updatedImage);
		}
	} catch (error) {
		console.error('Error updating image:', error);
		return json({ error: 'Failed to update image' }, { status: 500 });
	}
};

export const PATCH: RequestHandler = async ({ params, request }) => {
	try {
		const imageId = parseInt(params.id);

		if (isNaN(imageId)) {
			return json({ error: 'Invalid image ID' }, { status: 400 });
		}

		const body = await request.json();
		const updateData: any = { updatedAt: new Date() };

		// Only update provided fields
		if (body.title !== undefined) updateData.title = body.title;
		if (body.description !== undefined) updateData.description = body.description;

		// Check if image exists
		const existingImage = await db
			.select({ id: images.id })
			.from(images)
			.where(eq(images.id, imageId))
			.limit(1);

		if (existingImage.length === 0) {
			return json({ error: 'Image not found' }, { status: 404 });
		}

		// Update image
		const [updatedImage] = await db
			.update(images)
			.set(updateData)
			.where(eq(images.id, imageId))
			.returning();

		// Handle tags if provided
		if (body.tags !== undefined) {
			// Delete existing tags
			await db.delete(imageTags).where(eq(imageTags.imageId, imageId));

			// Insert new tags
			if (Array.isArray(body.tags) && body.tags.length > 0) {
				const tagValues = body.tags
					.map((tagName: string) => ({
						imageId,
						tagName: String(tagName).trim()
					}))
					.filter((tag: { tagName: string }) => tag.tagName.length > 0);

				if (tagValues.length > 0) {
					await db.insert(imageTags).values(tagValues);
				}
			}
		}

		return json(updatedImage);
	} catch (error) {
		console.error('Error patching image:', error);
		return json({ error: 'Failed to patch image' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const imageId = parseInt(params.id);

		if (isNaN(imageId)) {
			return json({ error: 'Invalid image ID' }, { status: 400 });
		}

		// Get image details for deletion from blob storage
		const image = await db
			.select({ imageUrl: images.imageUrl })
			.from(images)
			.where(eq(images.id, imageId))
			.limit(1);

		if (image.length === 0) {
			return json({ error: 'Image not found' }, { status: 404 });
		}

		// Delete from blob storage
		try {
			await deleteImage(image[0].imageUrl);
		} catch (blobError) {
			console.error('Failed to delete from blob storage:', blobError);
			// Continue with database deletion even if blob deletion fails
		}

		// Delete tags first (due to foreign key constraint)
		await db.delete(imageTags).where(eq(imageTags.imageId, imageId));

		// Delete from database
		await db.delete(images).where(eq(images.id, imageId));

		return json({ message: 'Image deleted successfully' });
	} catch (error) {
		console.error('Error deleting image:', error);
		return json({ error: 'Failed to delete image' }, { status: 500 });
	}
};
