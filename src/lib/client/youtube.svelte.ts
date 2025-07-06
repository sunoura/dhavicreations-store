import defaultVideos from '$lib/client/cache/default-videos.json';

// Date filtering configuration (matches API)
const PUBLISHED_AFTER = '2022-01-04T23:59:59Z'; // Only show videos published after January 4th, 2022

// Check if video was published after the cutoff date
function isVideoWithinDateRange(publishedAt: string): boolean {
	const videoDate = new Date(publishedAt);
	const cutoffDate = new Date(PUBLISHED_AFTER);
	return videoDate > cutoffDate;
}

interface YouTubeVideo {
	id: string;
	title: string;
	description: string;
	thumbnail: string;
	publishedAt: string;
	viewCount: string;
	duration: string;
	url: string;
}

interface YouTubeApiResponse {
	success: boolean;
	videos: YouTubeVideo[];
	count: number;
	totalAvailable?: number;
	error?: string;
}

// Global state for videos
export const youtubeVideos = $state<{
	videos: YouTubeVideo[];
	loading: boolean;
	error: string | null;
	isFromCache: boolean;
}>({
	videos: [],
	loading: false,
	error: null,
	isFromCache: true
});

// Helper function to parse ISO 8601 duration to readable format
function parseDuration(duration: string): string {
	const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
	if (!match) return '';

	const hours = match[1] ? parseInt(match[1]) : 0;
	const minutes = match[2] ? parseInt(match[2]) : 0;
	const seconds = match[3] ? parseInt(match[3]) : 0;

	if (hours > 0) {
		return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	}
	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Helper function to format view count
function formatViewCount(count: string): string {
	const num = parseInt(count);
	if (num >= 1000000) {
		return `${(num / 1000000).toFixed(1)}M views`;
	} else if (num >= 1000) {
		return `${(num / 1000).toFixed(1)}K views`;
	}
	return `${num} views`;
}

// Fetch videos from API route
async function fetchVideos(): Promise<YouTubeVideo[]> {
	try {
		const response = await fetch('/api/youtube');

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data: YouTubeApiResponse = await response.json();

		if (!data.success) {
			throw new Error(data.error || 'Failed to fetch videos');
		}

		return data.videos;
	} catch (error) {
		console.error('Error fetching videos:', error);
		throw error;
	}
}

// Load cached videos immediately
export function loadCachedVideos() {
	// Filter cached videos by publication date
	const filteredVideos = defaultVideos.videos.filter((video) =>
		isVideoWithinDateRange(video.publishedAt)
	);

	youtubeVideos.videos = filteredVideos;
	youtubeVideos.isFromCache = true;
	youtubeVideos.error = null;
	youtubeVideos.loading = false;

	console.log(
		`Loaded ${filteredVideos.length} cached videos (filtered by date: after ${PUBLISHED_AFTER})`
	);
}

// Load fresh videos from API
export async function loadFreshVideos() {
	youtubeVideos.loading = true;
	youtubeVideos.error = null;

	try {
		const freshVideos = await fetchVideos();

		// Only update if we got videos
		if (freshVideos.length > 0) {
			youtubeVideos.videos = freshVideos;
			youtubeVideos.isFromCache = false;
		}
	} catch (error) {
		youtubeVideos.error =
			error instanceof Error ? error.message : 'Failed to load fresh videos';
		console.error('YouTube API Error:', error);

		// Keep showing cached videos if API fails
		if (youtubeVideos.videos.length === 0) {
			loadCachedVideos();
		}
	} finally {
		youtubeVideos.loading = false;
	}
}

// Main function to load videos with cache-first approach
export async function loadVideos() {
	// Load cached videos immediately for instant display
	loadCachedVideos();

	// Then try to fetch fresh videos in the background
	await loadFreshVideos();
}
