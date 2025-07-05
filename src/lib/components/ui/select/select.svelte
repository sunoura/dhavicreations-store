<script lang="ts">
	import { Select as SelectPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import { ChevronDown } from 'lucide-svelte';

	let {
		ref = $bindable(null),
		value = $bindable(),
		disabled = $bindable(false),
		class: className,
		...restProps
	}: SelectPrimitive.RootProps = $props();
</script>

<SelectPrimitive.Root
	bind:ref
	bind:value
	bind:disabled
	data-slot="select"
	class={cn('relative', className)}
	{...restProps}
>
	<slot />
</SelectPrimitive.Root>
