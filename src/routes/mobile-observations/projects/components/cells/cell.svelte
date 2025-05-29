<script lang="ts">
	import type {
		Cell,
		TextCell as TextCellType,
		QueryCell as QueryCellType
	} from 'mobile-observations/projects/types';
	import TextCell from './text-cell.svelte';
	import QueryCell from './query-cell.svelte';
	import CellControls from './cell-controls.svelte';
	let { cell = $bindable() }: { cell: Cell } = $props();
</script>

<div class="relative size-full flex-1">
	<span class="absolute top-0 -translate-y-full text-2xs font-light text-muted-foreground">
		{cell.id}
	</span>
	{#if cell.type === 'text'}
		<TextCell bind:cell={cell as TextCellType} />
	{:else if cell.type === 'query'}
		<QueryCell bind:cell={cell as QueryCellType} />
	{/if}
	<CellControls {cell} class=" absolute right-4 top-0 -translate-y-1/2 " />
</div>
