// YouTube Configuration (Client-side safe)
// The actual API key is now handled securely on the server side

export const YOUTUBE_CONFIG = {
	// Channel configuration (safe to expose)
	CHANNEL_ID: 'UCbd8jNkjSMe6fYLcMMg4WpA',
	CHANNEL_HANDLE: '@dhavi.creations',
	
	// Display settings
	MAX_RESULTS: 10, // Maximum videos to fetch per request
	MIN_DURATION_MINUTES: 3, // Minimum duration for videos to display
} as const;

// Client-side feature flags
export const IS_DEVELOPMENT = typeof window !== 'undefined' && window.location.hostname === 'localhost';
export const ENABLE_MOCK_DATA_FALLBACK = true; // Enable fallback to mock data if API fails 
