import { put, del, list } from '@vercel/blob';
import type { PutBlobResult } from '@vercel/blob';

export interface UploadResult {
	url: string;
	pathname: string;
	size: number;
	uploadedAt: Date;
}

export interface BatchUploadResult {
	success: UploadResult[];
	failed: Array<{ file: File; error: string }>;
}

/**
 * Upload a single image to Vercel Blob
 */
export async function uploadImage(file: File, filename?: string): Promise<UploadResult> {
	try {
		const blobName = filename || file.name;
		const pathname = `dhavi-creations/images/${blobName}`;

		const { url } = await put(pathname, file, {
			access: 'public',
			addRandomSuffix: false
		});

		return {
			url,
			pathname,
			size: file.size,
			uploadedAt: new Date()
		};
	} catch (error) {
		throw new Error(
			`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Upload a thumbnail to Vercel Blob
 */
export async function uploadThumbnail(
	thumbnailBuffer: Buffer,
	filename: string
): Promise<UploadResult> {
	try {
		// Add _thumb suffix to filename
		const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
		const extension = filename.split('.').pop();
		const thumbnailFilename = `${nameWithoutExt}_thumb.${extension}`;
		const pathname = `dhavi-creations/images/thumbs/${thumbnailFilename}`;

		const { url } = await put(pathname, thumbnailBuffer, {
			access: 'public',
			addRandomSuffix: false
		});

		return {
			url,
			pathname,
			size: thumbnailBuffer.length,
			uploadedAt: new Date()
		};
	} catch (error) {
		throw new Error(
			`Failed to upload thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Upload multiple images to Vercel Blob
 */
export async function batchUploadImages(files: File[]): Promise<BatchUploadResult> {
	const result: BatchUploadResult = {
		success: [],
		failed: []
	};

	const uploadPromises = files.map(async (file) => {
		try {
			const uploadResult = await uploadImage(file);
			result.success.push(uploadResult);
		} catch (error) {
			result.failed.push({
				file,
				error: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	});

	await Promise.all(uploadPromises);
	return result;
}

/**
 * Delete an image from Vercel Blob
 */
export async function deleteImage(url: string): Promise<void> {
	try {
		await del(url);
	} catch (error) {
		throw new Error(
			`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Delete multiple images from Vercel Blob
 */
export async function batchDeleteImages(urls: string[]): Promise<{
	success: string[];
	failed: Array<{ url: string; error: string }>;
}> {
	const result = {
		success: [] as string[],
		failed: [] as Array<{ url: string; error: string }>
	};

	const deletePromises = urls.map(async (url) => {
		try {
			await deleteImage(url);
			result.success.push(url);
		} catch (error) {
			result.failed.push({
				url,
				error: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	});

	await Promise.all(deletePromises);
	return result;
}

/**
 * List all images in the dhavi-creations/images/ directory
 */
export async function listImages(): Promise<
	Array<{
		url: string;
		pathname: string;
		size: number;
		uploadedAt: Date;
	}>
> {
	try {
		const { blobs } = await list({ prefix: 'dhavi-creations/images/' });

		return blobs.map((blob) => ({
			url: blob.url,
			pathname: blob.pathname,
			size: blob.size,
			uploadedAt: new Date(blob.uploadedAt)
		}));
	} catch (error) {
		throw new Error(
			`Failed to list images: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Generate a unique filename to avoid conflicts
 */
export function generateUniqueFilename(originalName: string): string {
	const timestamp = Date.now();
	const randomSuffix = Math.random().toString(36).substring(2, 8);
	const extension = originalName.split('.').pop();
	const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');

	return `${nameWithoutExt}_${timestamp}_${randomSuffix}.${extension}`;
}
