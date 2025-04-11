<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { ArrowUp, ArrowDown } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { SortDirection } from '@tanstack/table-core';

	let {
		variant = 'link',
		sortDir = false,
		label,
		...restProps
	}: ComponentProps<typeof Button> & {
		label: string;
		sortDir?: false | SortDirection;
	} = $props();
</script>

<Button {variant} class="p-0" {...restProps}>
	{label}
	{#if sortDir === 'asc'}
		<ArrowUp class="ml-2 size-4" />
	{:else if sortDir === 'desc'}
		<ArrowDown class="ml-2 size-4" />
	{:else}
		<span class="ml-2 size-4"></span>
	{/if}
</Button>
