<script lang="ts">
	import { onMount } from 'svelte';
	import { youtubeVideos, loadVideos } from '$lib/client/youtube.svelte.js';
	import VideoCard from '$lib/components/site/VideoCard.svelte';

	onMount(() => {
		loadVideos();
	});
</script>

<!-- Hero Section -->
<section class="w-full">
	<div
		class="flex flex-col min-h-[300px] sm:min-h-[400px] md:flex-row md:min-h-[450px] lg:min-h-[500px]"
	>
		<div
			class="w-full bg-slate-600 min-h-[200px] sm:min-h-[300px] md:w-1/2 md:min-h-[350px] lg:min-h-[500px]"
		></div>
		<div
			class="flex w-full flex-col items-center justify-center bg-slate-200 px-4 py-6 sm:px-6 sm:py-8 md:w-1/2 md:px-8 md:py-10 lg:px-8"
		>
			<div
				class="text-center max-w-md sm:max-w-lg md:text-left md:pr-8 md:max-w-xl lg:max-w-none"
			>
				<h2 class="mb-2 text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
					Hand-painted traditions. <br /> Personalized creations.
				</h2>
				<a href="/" class="text-sm underline sm:text-base">Order Now</a>
			</div>
		</div>
	</div>
</section>

<!-- Highlights Section -->
<section class="py-10 sm:py-12 sm:px-6 md:py-16 md:px-8 lg:py-20 ">
	<div class="mx-auto max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
		<h2
			class="mb-6 text-center text-2xl font-semibold tracking-tight sm:mb-8 sm:text-3xl md:mb-10 md:text-4xl lg:text-5xl"
		>
			Ready for something unique?
		</h2>
		<div
			class="mb-8 flex flex-col gap-4 sm:mb-10 sm:gap-5 md:mb-12 md:gap-6 lg:flex-row lg:gap-6"
		>
			<div class="w-full lg:w-7/12">
				<div class="mb-3 sm:mb-4">
					<div class="mt-3 sm:mt-4">
						<img
							src="https://placehold.co/600x400"
							alt=""
							class="w-full h-64 object-cover lg:h-auto lg:object-contain"
						/>
						<div class="mt-3 sm:mt-4">
							<h3
								class="text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl"
							>
								Custom Design Orders
							</h3>
							<p
								class="mt-3 text-lg font-medium tracking-tight italic opacity-65 sm:text-xl lg:text-2xl"
							>
								Have an idea for a painted blouse, gift, or portrait on fabric?
								Let's bring it to life together.
							</p>
							<p class="mb-2 sm:mb-3"></p>
							<a href="/" class="text-sm underline sm:text-base">Shop Now</a>
						</div>
					</div>
				</div>
			</div>
			<div class="w-full lg:w-5/12">
				<div class="mt-0 lg:mt-14">
					<div class="mt-3 sm:mt-4">
						<img
							src="https://placehold.co/400x500"
							alt=""
							class="w-full h-64 object-cover lg:h-auto lg:object-contain"
						/>
						<div class="mt-3 sm:mt-4">
							<h3
								class="text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl"
							>
								Design Prints
							</h3>
							<p
								class="mt-3 text-lg font-medium tracking-tight italic opacity-65 sm:text-xl lg:text-2xl"
							>
								Get custom, trace-ready design outlines for your next project. Print
								at home. Paint with ease.
							</p>
							<p class="mb-2 sm:mb-3"></p>
							<a href="/" class="text-sm underline sm:text-base">Shop Now</a>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="mx-auto w-full sm:max-w-md md:max-w-2xl lg:max-w-[750px]">
			<img
				src="https://placehold.co/900x450"
				alt=""
				class="w-full h-64 object-cover lg:h-auto lg:object-contain"
			/>
			<div class="mt-3 sm:mt-4">
				<h3 class="text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
					Fabric Painting Kits
				</h3>
				<p
					class="mt-3 text-lg font-medium tracking-tight italic opacity-65 sm:text-xl lg:text-2xl"
				>
					Start your fabric painting journey with our beginner-friendly kit and curated
					materials.
				</p>
				<p class="mb-2 sm:mb-3"></p>
				<a href="/" class="text-sm underline sm:text-base">Shop Now</a>
			</div>
		</div>
	</div>
</section>

<!-- Fabric Kit Section -->
<section class="py-10 sm:py-12 sm:px-6 md:py-16 md:px-8 lg:py-20">
	<div class="flex flex-col lg:flex-row">
		<div class="w-full order-2 lg:w-1/2 lg:order-1">
			<div class="h-full bg-slate-200 p-6 sm:p-8 md:p-12 lg:p-16 xl:p-20">
				<h2
					class="mb-3 text-xs font-semibold uppercase tracking-widest opacity-40 sm:mb-4 sm:text-sm"
				>
					Fabric Painting Kit
				</h2>
				<p
					class="text-base tracking-tight leading-relaxed sm:text-lg md:text-xl lg:text-2xl"
				>
					Whether you're just starting or gifting someone their first brush, our kit is a
					gentle invitation into the world of fabric painting. Each box is personally
					assembled and includes everything you need to begin—trusted materials, a demo
					video, and the joy of making something with your hands. Begin your journey with
					us!
				</p>
				<div class="mb-8 sm:mb-12 md:mb-16 lg:mb-20"></div>
				<a href="/" class="text-sm underline sm:text-base mr-4">Learn More</a>
				<a href="/" class="text-sm underline sm:text-base">Buy Now</a>
			</div>
		</div>
		<div class="w-full order-1 lg:w-1/2 lg:order-2">
			<div class="h-80 w-full bg-slate-600 sm:h-80 md:h-96 lg:h-full"></div>
		</div>
	</div>
</section>

<!-- Social Content / YouTube Section -->
<section class="py-10 sm:py-12 sm:px-6 md:py-16 md:px-8 lg:py-20">
	<div class="mx-auto max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-3xl">
		<p
			class="mb-8 sm:mb-10 md:mb-12 lg:mb-12 text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-4xl tracking-tighter leading-tight text-center"
		>
			On our YouTube channel, you'll find painting tutorials, step-by-step demos, and stories
			from our studio. Whether you're learning to paint or just here for inspiration, we've
			got something for you.
		</p>
	</div>

	<div class="mt-6 sm:mt-7 md:mt-8 lg:mt-8">
		{#if youtubeVideos.loading}
			<div class="p-8 text-center text-gray-500">
				<p>Loading videos...</p>
			</div>
		{:else if youtubeVideos.error}
			<div class="p-8 text-center text-red-500">
				<p>Error loading videos: {youtubeVideos.error}</p>
			</div>
		{:else}
			<div class="flex gap-3 sm:gap-4 md:gap-4 lg:gap-4 overflow-x-scroll hide-scrollbar">
				{#each youtubeVideos.videos as video (video.id)}
					<VideoCard {video} />
				{/each}
			</div>
		{/if}
	</div>

	<div class="mx-auto max-w-xs sm:max-w-sm md:max-w-md lg:max-w-md xl:max-w-md justify-center">
		<p
			class="my-8 sm:my-10 md:my-12 lg:my-12 text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-4xl tracking-tighter"
		>
			Like what you see? Follow us today to stay updated!
		</p>
		<div class="flex justify-center">
			<div class="flex w-1/2 justify-center">
				<img
					src="/logos/youtube_logo.svg"
					class="w-24 sm:w-28 md:w-32 lg:w-40 xl:w-40"
					alt=""
				/>
			</div>
			<div class="flex w-1/2 justify-center">
				<img
					src="/logos/instagram_logo.svg"
					class="w-28 sm:w-32 md:w-36 lg:w-44 xl:w-44"
					alt=""
				/>
			</div>
		</div>
	</div>
</section>

<style>
	.hide-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.hide-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
