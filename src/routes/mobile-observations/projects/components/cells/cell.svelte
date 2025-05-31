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

	const cellStyles = {
		text: {
			border: 'border-l-4 border-l-blue-500 border border-gray-200 dark:border-gray-700',
			background: 'bg-blue-50/30 dark:bg-transparent',
			accent: 'text-blue-600 dark:text-blue-400'
		},
		query: {
			border: 'border-l-4 border-l-purple-500 border border-gray-200 dark:border-gray-700',
			background: 'bg-purple-50/30 dark:bg-transparent',
			accent: 'text-purple-600 dark:text-purple-400'
		}
	};

	const currentStyle = $derived(
		cellStyles[cell.type as keyof typeof cellStyles] || cellStyles.text
	);
</script>

<div
	class="relative size-full flex-1 rounded-lg {currentStyle.border} {currentStyle.background} transition-all duration-200 hover:shadow-sm"
>
	<span
		class="absolute left-2 top-2 text-2xs font-medium {currentStyle.accent} rounded-full bg-white/80 px-2 py-1 dark:bg-white"
	>
		{cell.type.toUpperCase()} • {cell.id}
	</span>

	<div class="p-4 pt-8">
		{#if cell.type === 'text'}
			<TextCell bind:cell={cell as TextCellType} />
		{:else if cell.type === 'query'}
			<QueryCell bind:cell={cell as QueryCellType} />
		{/if}
	</div>

	<CellControls {cell} class="absolute right-4 top-2" />
</div>
