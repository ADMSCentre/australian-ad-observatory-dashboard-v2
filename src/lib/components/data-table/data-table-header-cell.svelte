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

<Button
	{variant}
	class="h-auto gap-1.5 p-0 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground"
	{...restProps}
>
	<span class="truncate">{label}</span>
	{#if sortDir === 'asc'}
		<ArrowUp class="size-3.5 shrink-0" />
	{:else if sortDir === 'desc'}
		<ArrowDown class="size-3.5 shrink-0" />
	{:else}
		<span class="size-3.5 shrink-0"></span>
	{/if}
</Button>
