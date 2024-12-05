<script lang="ts">
	import { createGrid, type GridApi, type GridOptions } from 'ag-grid-community';
	import 'ag-grid-community/styles/ag-grid.css';
	import 'ag-grid-community/styles/ag-theme-alpine.css';
	import Input from '../ui/input/input.svelte';
	import { Search } from 'lucide-svelte';

	const {
		columnDefs,
		rowData,
		style,
		searchable = true,
		...options
	} = $props<
		{
			style?: Record<string, string>;
			searchable?: boolean;
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
		// new Grid(gridDiv, gridOptions);
		const gridOptions = {
			columnDefs,
			rowData,
			...options
		};
		// Clear the gridDiv before creating a new grid
		gridDiv.innerHTML = '';
		api = createGrid(gridDiv, gridOptions);
	});

	const onSearch = () => {
		api?.setGridOption('quickFilterText', searchTerms);
	};
</script>

<div class="flex flex-col gap-2">
	{#if searchable}
		<div class="relative flex items-center">
			<Search size={16} class="absolute left-2 text-muted-foreground" />
			<Input class="pl-8" bind:value={searchTerms} placeholder="Search..." oninput={onSearch} />
		</div>
	{/if}

	<div bind:this={gridDiv} class="ag-theme-alpine" style={styleStr}></div>
</div>
