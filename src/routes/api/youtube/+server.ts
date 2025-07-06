import { json } from '@sveltejs/kit';
import { YOUTUBE_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

// YouTube API configuration
const YOUTUBE_CONFIG = {
	API_KEY: YOUTUBE_API_KEY,
	CHANNEL_ID: 'UCbd8jNkjSMe6fYLcMMg4WpA',
	MAX_RESULTS: 20,
	MIN_DURATION_MINUTES: 3,
	// Only show videos published after January 4th, 2022
	PUBLISHED_AFTER: '2022-01-04T23:59:59Z', // Exclude videos from Jan 4th and earlier
} as const;

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

// Fallback mock data when API fails
const FALLBACK_VIDEOS: YouTubeVideo[] = [
	{
		id: 'mock1',
		title: 'Sample Dhavi Creations Video 1',
		description: 'Sample creative content from Dhavi Creations.',
		thumbnail: '/favicon.png',
		publishedAt: '2022-06-15T10:00:00Z',
		viewCount: '1250',
		duration: '5:32',
		url: 'https://youtube.com/@dhavi.creations'
	},
	{
		id: 'mock2',
		title: 'Sample Dhavi Creations Video 2',
		description: 'Another sample creative video showcasing our work.',
		thumbnail: '/favicon.png',
		publishedAt: '2022-08-20T14:30:00Z',
		viewCount: '2100',
		duration: '7:45',
		url: 'https://youtube.com/@dhavi.creations'
	}
];

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

// Check if video was published after the cutoff date
function isVideoWithinDateRange(publishedAt: string): boolean {
	const videoDate = new Date(publishedAt);
	const cutoffDate = new Date(YOUTUBE_CONFIG.PUBLISHED_AFTER);
	return videoDate > cutoffDate;
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

// Fetch recent videos from channel
async function fetchRecentVideos(): Promise<YouTubeVideo[]> {
	try {
		// Check if API key is configured
		if (!YOUTUBE_CONFIG.API_KEY || YOUTUBE_CONFIG.API_KEY === 'your_youtube_api_key_here') {
			console.log('YouTube API key not configured, using fallback data');
			return [];
		}

		// First, get the uploads playlist ID
		const channelResponse = await fetch(
			`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${YOUTUBE_CONFIG.CHANNEL_ID}&key=${YOUTUBE_CONFIG.API_KEY}`
		);
		
		if (!channelResponse.ok) {
			console.log('YouTube API channel request failed:', channelResponse.status, channelResponse.statusText);
			return [];
		}
		
		const channelData = await channelResponse.json();
		const uploadsPlaylistId = channelData.items[0]?.contentDetails?.relatedPlaylists?.uploads;
		
		if (!uploadsPlaylistId) {
			console.log('Could not find uploads playlist');
			return [];
		}
		
		// Get recent videos from uploads playlist
		const videosResponse = await fetch(
			`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${YOUTUBE_CONFIG.MAX_RESULTS}&key=${YOUTUBE_CONFIG.API_KEY}`
		);
		
		if (!videosResponse.ok) {
			console.log('YouTube API videos request failed:', videosResponse.status, videosResponse.statusText);
			return [];
		}
		
		const videosData = await videosResponse.json();
		
		// Get additional details for each video
		const videoIds = videosData.items.map((item: any) => 
			item.snippet.resourceId?.videoId
		).filter(Boolean);
		
		if (videoIds.length === 0) {
			return [];
		}
		
		const detailsResponse = await fetch(
			`https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds.join(',')}&key=${YOUTUBE_CONFIG.API_KEY}`
		);
		
		const detailsData = await detailsResponse.json();
		
		// Combine data and filter for videos meeting minimum duration
		return videosData.items
			.map((item: any, index: number): YouTubeVideo => {
				const videoId = item.snippet.resourceId?.videoId;
				const details = detailsData.items[index];
				const duration = details?.contentDetails?.duration || '';
				
				return {
					id: videoId,
					title: item.snippet.title,
					description: item.snippet.description,
					thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.high?.url,
					publishedAt: item.snippet.publishedAt,
					viewCount: details?.statistics?.viewCount || '0',
					duration: parseDuration(duration),
					url: `https://www.youtube.com/watch?v=${videoId}`
				};
			})
			.filter((video: YouTubeVideo) => {
				// Filter for videos meeting minimum duration requirement
				const durationParts = video.duration.split(':');
				const totalMinutes = durationParts.length === 3 
					? parseInt(durationParts[0]) * 60 + parseInt(durationParts[1])
					: parseInt(durationParts[0]);
				
				// Check both duration and publication date
				return totalMinutes >= YOUTUBE_CONFIG.MIN_DURATION_MINUTES && 
					   isVideoWithinDateRange(video.publishedAt);
			});
			
	} catch (error) {
		console.log('Error fetching recent videos:', error);
		return [];
	}
}

// Fetch popular videos from channel
async function fetchPopularVideos(): Promise<YouTubeVideo[]> {
	try {
		// Check if API key is configured
		if (!YOUTUBE_CONFIG.API_KEY || YOUTUBE_CONFIG.API_KEY === 'your_youtube_api_key_here') {
			return [];
		}

		const response = await fetch(
			`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${YOUTUBE_CONFIG.CHANNEL_ID}&maxResults=${YOUTUBE_CONFIG.MAX_RESULTS}&order=viewCount&type=video&videoDuration=medium&publishedAfter=${YOUTUBE_CONFIG.PUBLISHED_AFTER}&key=${YOUTUBE_CONFIG.API_KEY}`
		);
		
		if (!response.ok) {
			console.log('YouTube API popular videos request failed:', response.status, response.statusText);
			return [];
		}
		
		const data = await response.json();
		
		// Get additional details for each video
		const videoIds = data.items.map((item: any) => 
			typeof item.id === 'string' ? item.id : item.id.videoId
		);
		
		if (videoIds.length === 0) {
			return [];
		}
		
		const detailsResponse = await fetch(
			`https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds.join(',')}&key=${YOUTUBE_CONFIG.API_KEY}`
		);
		
		const detailsData = await detailsResponse.json();
		
		return data.items
			.map((item: any, index: number): YouTubeVideo => {
				const videoId = typeof item.id === 'string' ? item.id : item.id.videoId;
				const details = detailsData.items[index];
				
				return {
					id: videoId,
					title: item.snippet.title,
					description: item.snippet.description,
					thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.high?.url,
					publishedAt: item.snippet.publishedAt,
					viewCount: details?.statistics?.viewCount || '0',
					duration: parseDuration(details?.contentDetails?.duration || ''),
					url: `https://www.youtube.com/watch?v=${videoId}`
				};
			})
			.filter((video: YouTubeVideo) => {
				// Double-check date filtering (API should already handle this, but being safe)
				return isVideoWithinDateRange(video.publishedAt);
			});
		
	} catch (error) {
		console.log('Error fetching popular videos:', error);
		return [];
	}
}

export const GET: RequestHandler = async () => {
	try {
		// Fetch both recent and popular videos to create a diverse pool
		const [recent, popular] = await Promise.all([
			fetchRecentVideos(),
			fetchPopularVideos()
		]);
		
		console.log(`Fetched ${recent.length} recent videos and ${popular.length} popular videos`);
		
		// Combine and deduplicate videos (prefer recent if duplicate)
		const videoMap = new Map<string, YouTubeVideo>();
		
		// Add recent videos first (higher priority)
		recent.forEach(video => videoMap.set(video.id, video));
		
		// Add popular videos that aren't already included
		popular.forEach(video => {
			if (!videoMap.has(video.id)) {
				videoMap.set(video.id, video);
			}
		});
		
		// Convert to array and shuffle for randomness
		let allVideos = Array.from(videoMap.values());
		
		// If no videos were fetched (API issues), use fallback data
		if (allVideos.length === 0) {
			console.log('No videos fetched from API, using fallback data');
			allVideos = FALLBACK_VIDEOS;
		}
		
		const shuffledVideos = shuffleArray(allVideos);
		
		// Select up to 12 random videos for display
		const selectedVideos = shuffledVideos.slice(0, 12);
		
		return json({
			success: true,
			videos: selectedVideos,
			count: selectedVideos.length,
			totalAvailable: allVideos.length,
			usingFallback: allVideos === FALLBACK_VIDEOS
		});
		
	} catch (error) {
		console.log('YouTube API Error:', error);
		
		// Return fallback data on any error
		return json({
			success: true,
			videos: FALLBACK_VIDEOS,
			count: FALLBACK_VIDEOS.length,
			totalAvailable: FALLBACK_VIDEOS.length,
			usingFallback: true,
			error: error instanceof Error ? error.message : 'Failed to fetch videos'
		});
	}
}; 

