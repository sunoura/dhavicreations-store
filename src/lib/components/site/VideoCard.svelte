<script lang="ts">
	interface Props {
		video: {
			id: string;
			title: string;
			description: string;
			thumbnail: string;
			publishedAt: string;
			viewCount: string;
			duration: string;
			url: string;
		};
	}

	let { video }: Props = $props();

	// Format view count
	function formatViewCount(count: string): string {
		const num = parseInt(count);
		if (num >= 1000000) {
			return `${(num / 1000000).toFixed(1)}M views`;
		} else if (num >= 1000) {
			return `${(num / 1000).toFixed(1)}K views`;
		}
		return `${num} views`;
	}

	// Format published date
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		const now = new Date();
		const diffTime = Math.abs(now.getTime() - date.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 1) return '1 day ago';
		if (diffDays < 7) return `${diffDays} days ago`;
		if (diffDays < 30)
			return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
		if (diffDays < 365)
			return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
		return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
	}

	function handleClick() {
		window.open(video.url, '_blank');
	}
</script>

<div
	class="cursor-pointer transition-transform duration-200 ease-in-out max-w-[300px] w-full flex-shrink-0 hover:-translate-y-0.5"
	role="button"
	tabindex="0"
	onclick={handleClick}
	onkeydown={(e) => e.key === 'Enter' && handleClick()}
>
	<div class="relative w-full mb-2">
		<img
			src={video.thumbnail}
			alt={video.title}
			class="w-full h-auto aspect-video object-cover rounded-lg block mb-2"
			loading="lazy"
		/>
		<div
			class="absolute bottom-2 right-2 bg-black/80 text-white px-1.5 py-0.5 rounded text-xs font-medium"
		>
			{video.duration}
		</div>
	</div>
	<div class="px-1">
		<h3 class="text-sm font-semibold leading-tight mb-1 line-clamp-2 sm:text-[0.95rem]">
			{video.title}
		</h3>
		<div class="flex flex-col text-xs text-gray-500 gap-0.5 sm:text-[0.8rem]">
			<span>{formatViewCount(video.viewCount)}</span>
			<span>{formatDate(video.publishedAt)}</span>
		</div>
	</div>
</div>
