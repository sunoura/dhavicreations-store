import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { images, imageTags } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { uploadImage, uploadThumbnail, generateUniqueFilename } from '$lib/server/vercel-blob';
import { generateThumbnailFromFile } from '$lib/server/utils/image-utils';

export const GET: RequestHandler = async () => {
	try {
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

		// Get tags for each image
		const imagesWithTags = await Promise.all(
			allImages.map(async (image) => {
				const imageTagsResult = await db
					.select({ tagName: imageTags.tagName })
					.from(imageTags)
					.where(eq(imageTags.imageId, image.id));

				return {
					...image,
					tags: imageTagsResult.map((tag) => tag.tagName)
				};
			})
		);

		return json(imagesWithTags);
	} catch (error) {
		console.error('Error fetching images:', error);
		return json({ error: 'Failed to fetch images' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;
		const title = formData.get('title') as string;
		const description = formData.get('description') as string;
		const tags = formData.get('tags') as string;

		if (!file) {
			return json({ error: 'No file provided' }, { status: 400 });
		}

		if (!title) {
			return json({ error: 'Title is required' }, { status: 400 });
		}

		// Generate unique filename
		const uniqueFilename = generateUniqueFilename(file.name);

		// Upload original image to Vercel Blob
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

		// Insert into database
		const [newImage] = await db
			.insert(images)
			.values({
				imageUrl: uploadResult.url,
				thumbUrl: thumbnailUrl,
				filename: uniqueFilename,
				title,
				description: description || null,
				size: uploadResult.size
			})
			.returning();

		// Handle tags if provided
		if (tags) {
			const tagArray = tags
				.split(',')
				.map((tag) => tag.trim())
				.filter((tag) => tag.length > 0);

			if (tagArray.length > 0) {
				const tagValues = tagArray.map((tagName) => ({
					imageId: newImage.id,
					tagName
				}));

				await db.insert(imageTags).values(tagValues);
			}
		}

		return json(newImage, { status: 201 });
	} catch (error) {
		console.error('Error uploading image:', error);
		return json({ error: 'Failed to upload image' }, { status: 500 });
	}
};
