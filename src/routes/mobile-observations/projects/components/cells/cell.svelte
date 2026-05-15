<script lang="ts">
	import type {
		Cell,
		TextCell as TextCellType,
		QueryCell as QueryCellType
	} from 'mobile-observations/projects/types';
	import TextCell from './text-cell.svelte';
	import QueryCell from './query-cell.svelte';
	import CellControls from './cell-controls.svelte';
	import { AlertTriangle } from 'lucide-svelte';
	import { twMerge } from 'tailwind-merge';
	let { cell = $bindable() }: { cell: Cell } = $props();
</script>

<div
	class={twMerge(
		'group/cell relative size-full flex-1 overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-colors duration-200 focus-within:border-brand/80 focus-within:ring-1 focus-within:ring-brand/20',
		cell.hasChanges ? 'border-brand/80 ring-1 ring-brand/20' : 'border-border'
	)}
>
	<div
		class="flex min-h-11 items-center justify-between gap-3 border-b border-border bg-muted/30 px-3 py-2"
	>
		<div class="flex min-w-0 items-center gap-2">
			<span
				class={twMerge(
					'shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize',
					cell.hasChanges ? 'bg-brand text-white' : 'bg-muted text-muted-foreground'
				)}
			>
				{cell.type}
			</span>
			{#if cell.hasChanges}
				<span class="flex min-w-0 items-center gap-1 text-xs font-medium text-brand">
					<AlertTriangle class="size-3.5 shrink-0" />
					<span class="truncate">Unsaved changes. Save your work.</span>
				</span>
			{/if}
		</div>

		<CellControls {cell} class="shrink-0" />
	</div>

	<div class="p-4">
		{#if cell.type === 'text'}
			<TextCell bind:cell={cell as TextCellType} />
		{:else if cell.type === 'query'}
			<QueryCell bind:cell={cell as QueryCellType} />
		{/if}
	</div>
</div>
