<script lang="ts">
	import { ShoppingCart, FileHeart, Download } from '@lucide/svelte';
	import * as Accordion from '$lib/components/ui/accordion/index.js';

	let photos = [
		{ src: 'https://placehold.co/600x600', alt: 'Product Image 1' },
		{ src: 'https://placehold.co/600x600', alt: 'Product Image 2' },
		{ src: 'https://placehold.co/600x600', alt: 'Product Image 3' },
		{ src: 'https://placehold.co/600x600', alt: 'Product Image 4' }
	];
</script>

<div class="bg-white">
	<div class="mx-auto max-w-6xl bg-white px-6 pt-10 pb-10">
		<div class="product-container flex">
			<div class=" product-images w-2/3">
				<div class="flex gap-4">
					<div class="images-list flex w-[100px] flex-col gap-4">
						{#each photos as photo}
							<div class="image-item">
								<img src={photo.src} alt={photo.alt} />
							</div>
						{/each}
					</div>
					<div class="product-image">
						<img src={photos[0].src} alt={photos[0].alt} />
					</div>
				</div>
			</div>
			<div class="product-details flex w-1/3 flex-col justify-between space-y-4 px-4 py-6">
				<div class="info-container space-y-4">
					<div class="product-title">
						<h1 class="text-4xl font-semibold tracking-tight">
							Fabric Painting Starter Kit
						</h1>
					</div>
					<div class="product-price">
						<p class="text-2xl font-semibold">
							Rs. 900 <span class="text-sm text-gray-500">+ Shipping</span>
						</p>
					</div>
					<div class="product-description mb-6">
						<p class="text-sm text-gray-500">
							Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
							Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
							Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
							Quisquam, quos.
						</p>
					</div>

					<div class="product-attributes max-w-xs space-y-1 border-t pt-2">
						<div class="attribute-item flex border-b pb-2">
							<span class="attribute-label w-1/2">Dimensions</span>
							<span class="attribute-value w-1/2">100x100cm</span>
						</div>
						<div class="attribute-item flex border-b pb-2">
							<span class="attribute-label w-1/2">Weight</span>
							<span class="attribute-value w-1/2">100g</span>
						</div>
					</div>
				</div>
				<div class="cta-buttons space-y-2">
					<button class="flex items-center justify-between gap-4">
						<span>Add to Cart</span>
						<ShoppingCart />
					</button>
					<button class="flex items-center justify-between gap-4">
						<span>Add to Wishlist</span>
						<FileHeart />
					</button>
					<button class="flex items-center justify-between gap-4">
						<span>Download Shopping List</span>
						<Download />
					</button>
				</div>
			</div>
		</div>

		<div class="product-extra-info">
			<section class="mt-12">
				<div class="mx-auto max-w-3xl">
					<p class="text-4xl tracking-tighter">
						Color is a daily pleasure we can tap into. It reminds us of beauty and joy.
						Our values are intrinsic to all that we do, from the way we make internal
						decisions to the look and feel of our designs.
					</p>
				</div>
			</section>
		</div>

		<div class="mx-auto flex max-w-4xl py-12">
			<div class="grid w-full grid-cols-3 gap-2">
				<div class="grid-item col-span-2 bg-slate-500">01</div>
				<div class="grid-item bg-slate-500">02</div>
				<div class="grid-item col-span-3 bg-slate-500">03</div>
			</div>
		</div>

		<div class="product-extra-info">
			<section class="mt-8">
				<div class="mx-auto max-w-3xl">
					<div class="mb-10 px-6 text-3xl font-medium tracking-tight">
						<p>List of items included in the kit:</p>
					</div>
					<section id="kit-contents" class="kit-contents mb-10 px-6">
						<div class="flex">
							<div class="w-1/3">
								<ul class="list">
									<li>11 Designs</li>
									<li>Embroidery Ring - 6 Inch</li>
									<li>Raw Silk Cloth - 0.5 Meter</li>
									<li>Paint Palette</li>
									<li>Paper Tape</li>
									<li>Tracing Paper Large A2 Sheet</li>
									<li>A4 White Papers - 2</li>
									<li>
										<p class="mb-1 font-semibold">Carbon Papers:</p>
										<ul class="list">
											<li>2 Yellow</li>
											<li>2 White</li>
										</ul>
									</li>
								</ul>
							</div>
							<div class="w-1/3">
								<ul class="list">
									<li>
										<p class="mb-1 font-semibold">Fevicryl Acrylic Paints:</p>
										<ul class="list">
											<li>Crimson (Red)</li>
											<li>Light Green</li>
											<li>Prussian Blue</li>
											<li>Golden Yellow</li>
											<li>Burnt Sienna (Brown)</li>
											<li>Flesh Tint</li>
											<li>Black</li>
											<li>White</li>
											<li>Pearl Metallic Gold</li>
										</ul>
									</li>
								</ul>
							</div>
							<div class="w-1/3">
								<ul class="list">
									<li>3D Outliner - Pearl Metallic Gold</li>
									<li>Fabric Medium 1</li>
									<li>Black Sketch Pen</li>
									<li>Ball point Pen</li>
									<li>Assorted stones</li>
									<li>
										<p class="mb-1 font-semibold">Camlin Brushes:</p>
										<ul class="list">
											<li>No. 00 Round Brush</li>
											<li>No. 1 Round Brush</li>
											<li>No. 1 Flat Brush</li>
											<li>No. 2 Flat Brush</li>
										</ul>
									</li>
								</ul>
							</div>
						</div>
						<!-- <div class="button-container mt-8 space-x-2 text-center">
                            <button class="max-w-xs text-center"> Download Shopping List </button>
                            <button class="max-w-xs"> Download Sample Designs </button>
                        </div> -->
					</section>
				</div>
			</section>
		</div>
	</div>
	<section class="mx-auto mb-12 max-w-4xl">
		<div class="aspect-video w-full bg-slate-500"></div>
	</section>

	<section class="faq mx-auto max-w-3xl">
		<div class=" text-3xl">
			<!-- <p class="mb-3 text-4xl font-medium tracking-tight">Frequently Asked Questions</p> -->
			<Accordion.Root type="single" class="text-lg">
				<!-- <Accordion.Item value="item-1" data-state="open">
					<Accordion.Trigger>
						<p class="faq-qn">What does the kit include?</p>
					</Accordion.Trigger>
					<Accordion.Content>
						<p class="faq-ans">
							The list of items is mentioned above. <a href="#kit-contents" class="std-link"
								>Click here</a
							>
							to see the full list.
							<span class="hidden">
								You can also watch the unboxing video <a class="std-link" href="#yt-link">here</a>.
							</span>
						</p>
					</Accordion.Content>
				</Accordion.Item> -->
				<Accordion.Item value="item-2">
					<Accordion.Trigger>
						<p class="faq-qn">Where can I find tutorials or lessons?</p>
					</Accordion.Trigger>
					<Accordion.Content>
						<div class="faq-ans">
							<p class="mb-3">Please watch my beginner tutorial videos on YouTube:</p>

							<ul class="list">
								<li>
									<a
										class="std-link"
										href="https://youtu.be/aSvqwHMQRX8?si=lqlD-__uHTBmrd1W"
										target="_blank"
										>Fabric Painting Basics Tutorial for beginners</a
									>
								</li>
								<li>
									<a
										class="std-link"
										href="https://youtu.be/20QCy4fCZhI?si=8OpFX6DLdvEQOkZX"
										target="_blank">How to do Tanjore Style Fabric Painting</a
									>
								</li>
							</ul>

							<span class="hidden">
								For full-length, real-time painting videos, join our community by
								becoming a YouTube channel member.
							</span>
						</div>
					</Accordion.Content>
				</Accordion.Item>
				<Accordion.Item value="item-3">
					<Accordion.Trigger>
						<p class="faq-qn">What other types of cloth can I paint on?</p>
					</Accordion.Trigger>
					<Accordion.Content>
						<p class="faq-ans">
							The kit includes a half-meter white semi-raw silk cloth for practice.
							You can also use pure raw silk and similar absorbent fabrics. The cloth
							should soak in the paint for the design to stay. <span class="hidden"
								>Watch the video on choosing the right fabric here.</span
							>
						</p>
					</Accordion.Content>
				</Accordion.Item>
				<Accordion.Item value="item-4">
					<Accordion.Trigger>
						<p class="faq-qn">
							What is the difference between acrylic paints and fabric paints?
						</p>
					</Accordion.Trigger>
					<Accordion.Content>
						<div class="faq-ans">
							<p class="mb-2">
								Acrylic paints are commonly used for painting on canvas but can also
								work as fabric paints when mixed with the included fabric medium
								(Fevicryl Medium 1). Both options work well for painting on fabric
								with the included medium. I’ve personally used acrylic paints with
								the fabric medium for 3 years with great results.
							</p>
							<ul class="list">
								<li>
									<strong>Acrylic Paints:</strong>&nbsp;Widely available, easy to
									find in any stationary store.
								</li>
								<li>
									<strong>Fabric Paints:</strong>&nbsp;Often sold as sets, harder
									to find individual colors.
								</li>
							</ul>
						</div>
					</Accordion.Content>
				</Accordion.Item>
				<span class="hidden">
					<Accordion.Item value="item-5">
						<Accordion.Trigger>
							<p class="faq-qn">Where can I get feedback on my work?</p>
						</Accordion.Trigger>
						<Accordion.Content>
							<div class="faq-ans">
								<p class="mb-2">
									Join our YouTube community to share your work and get feedback
									from peers. Becoming a member gives you access to a supportive
									group of like-minded artists.
								</p>
							</div>
						</Accordion.Content>
					</Accordion.Item>
				</span>
			</Accordion.Root>
		</div>
	</section>
	<section class="mx-auto my-12 max-w-3xl py-4 pb-12">
		<p class="text-center text-4xl tracking-tighter">
			Color is a daily pleasure we can tap into. It reminds us of beauty and joy.
		</p>
		<div class="flex justify-center gap-8 py-2">
			<a href="/" class="block pt-4 text-5xl font-normal tracking-tighter underline"
				>Buy Now</a
			>
			<a href="/" class="block pt-4 text-5xl font-normal tracking-tighter underline">Share</a>
		</div>

		<div class="flex gap-4 pt-8">
			<button class="flex items-center justify-between gap-4">
				<span>Download Shopping List</span>
				<Download />
			</button>
			<button class="flex items-center justify-between gap-4">
				<span>Download Sample Designs</span>
				<Download />
			</button>
		</div>
	</section>
</div>

<style>
	.grid-item {
		height: 280px;
		width: 100%;
		padding: 10px;
		font-size: 18px;
	}

	ul > li > ul > li {
		padding-left: 10px;
	}

	.list > li {
		margin-bottom: 0.2rem;
	}

	button {
		font-family: monospace;
		font-size: 1rem;
		width: 100%;
		padding: 0.6rem 1.2rem;
		background-color: #000;
		color: #fff;
		border: none;
		cursor: pointer;
	}

	button:disabled {
		background-color: #666;
		cursor: not-allowed;
	}

	.faq-qn {
		font-size: 1.5rem;
		letter-spacing: -0.02em;
	}

	.faq-ans {
		font-size: 1.2rem;
		font-weight: 400;
	}
</style>
