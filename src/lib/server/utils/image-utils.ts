import sharp from 'sharp';

/**
 * Generate a thumbnail from an image buffer
 */
export async function generateThumbnail(
	imageBuffer: Buffer,
	options: {
		width?: number;
		height?: number;
		quality?: number;
		format?: 'jpeg' | 'webp' | 'png';
	} = {}
): Promise<Buffer> {
	const { width = 300, height = 300, quality = 80, format = 'jpeg' } = options;

	try {
		const thumbnail = sharp(imageBuffer)
			.resize(width, height, {
				fit: 'cover',
				position: 'center'
			})
			[format]({ quality });

		return await thumbnail.toBuffer();
	} catch (error) {
		throw new Error(
			`Failed to generate thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Generate a thumbnail from a File object
 */
export async function generateThumbnailFromFile(
	file: File,
	options: {
		width?: number;
		height?: number;
		quality?: number;
		format?: 'jpeg' | 'webp' | 'png';
	} = {}
): Promise<Buffer> {
	try {
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		return await generateThumbnail(buffer, options);
	} catch (error) {
		throw new Error(
			`Failed to generate thumbnail from file: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Get image metadata
 */
export async function getImageMetadata(imageBuffer: Buffer): Promise<{
	width: number;
	height: number;
	format: string;
	hasAlpha: boolean;
}> {
	try {
		const metadata = await sharp(imageBuffer).metadata();
		return {
			width: metadata.width || 0,
			height: metadata.height || 0,
			format: metadata.format || 'unknown',
			hasAlpha: metadata.hasAlpha || false
		};
	} catch (error) {
		throw new Error(
			`Failed to get image metadata: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}
