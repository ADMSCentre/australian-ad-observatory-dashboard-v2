<script lang="ts">
	import { createGrid, type GridApi, type GridOptions } from 'ag-grid-community';
	import 'ag-grid-community/styles/ag-grid.css';
	import 'ag-grid-community/styles/ag-theme-alpine.css';
	import Input from '../ui/input/input.svelte';
	import { DownloadIcon, Search } from 'lucide-svelte';
	import { theme } from '$lib/states/theme.svelte';
	import { twMerge } from 'tailwind-merge';
	import Button from '../ui/button/button.svelte';

	const {
		columnDefs,
		rowData,
		class: className = '',
		style,
		searchable = true,
		downloadable = true,
		...options
	} = $props<
		{
			class?: string;
			style?: Record<string, string>;
			searchable?: boolean;
			downloadable?: boolean;
		} & GridOptions
	>();

	const styleStr = $derived.by(() => {
		if (!style) return '';
		return Object.entries(style)
			.map(([key, value]) => `${key}: ${value}`)
			.join(';');
	});

	let gridDiv: HTMLDivElement;
	let api = $state<GridApi>();
	let searchTerms = $state('');

	$effect(() => {
		const gridOptions = {
			columnDefs,
			rowData,
			enableCellTextSelection: true,
			...options
		};
		// Clear the gridDiv before creating a new grid
		gridDiv.innerHTML = '';
		api = createGrid(gridDiv, gridOptions);
	});

	const onSearch = () => {
		api?.setGridOption('quickFilterText', searchTerms);
	};

	function exportGrid() {
		if (api) {
			const now = new Date();
			const timeString = now
				.toLocaleDateString('en-GB', {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit',
					hour: '2-digit',
					minute: '2-digit'
				})
				.replace(/\/|:/g, '')
				.replace(', ', '_');
			api.exportDataAsCsv({
				fileName: `export_${timeString}.csv`
			});
		}
	}
</script>

<div class="flex h-full flex-col gap-2">
	<div class="flex w-full items-center gap-2">
		{#if searchable}
			<div class="relative flex w-full items-center">
				<Search size={16} class="absolute left-2 text-muted-foreground" />
				<Input class="pl-8" bind:value={searchTerms} placeholder="Search..." oninput={onSearch} />
			</div>
		{/if}
		{#if downloadable}
			<Button onclick={exportGrid} aria-label="Download CSV">
				<DownloadIcon class="size-4" />
				Export Table
			</Button>
		{/if}
	</div>

	<div
		bind:this={gridDiv}
		class={twMerge(theme.mode === 'light' ? 'ag-theme-alpine' : 'ag-theme-alpine-dark', className)}
		style={styleStr}
	></div>
</div>
