<script lang="ts">
	import { Select as SelectPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import { ChevronDown } from '@lucide/svelte';

	let {
		value = $bindable(),
		disabled = $bindable(false),
		class: className,
		children,
		...restProps
	}: any = $props();
</script>

<SelectPrimitive.Root
	{value}
	{disabled}
	data-slot="select"
	class={cn('relative', className)}
	{...restProps}
>
	{@render children?.()}
</SelectPrimitive.Root>
