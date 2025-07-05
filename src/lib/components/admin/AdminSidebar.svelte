<script lang="ts">
	import { Image, Package2 } from '@lucide/svelte';

	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	const items = [
		{
			title: 'Images',
			url: '/admin/manage/images',
			icon: Image
		},
		{
			title: 'Products',
			url: '/admin/manage/products',
			icon: Package2
		}
	];
</script>

<Sidebar.Root>
	<Sidebar.Header />
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Manage</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each items as item (item.title)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet child({ props })}
									<a href={item.url} {...props}>
										<item.icon />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
		<Sidebar.Group />
	</Sidebar.Content>
	<Sidebar.Footer />
</Sidebar.Root>
