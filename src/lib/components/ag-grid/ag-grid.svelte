<script lang="ts">
	import { createGrid, type GridOptions } from 'ag-grid-community';
	import 'ag-grid-community/styles/ag-grid.css';
	import 'ag-grid-community/styles/ag-theme-alpine.css';

	const { columnDefs, rowData, style, ...options } = $props<
		{
			style: Record<string, string>;
		} & GridOptions
	>();

	const styleStr = $derived.by(() => {
		return Object.entries(style)
			.map(([key, value]) => `${key}: ${value}`)
			.join(';');
	});

	let gridDiv: HTMLDivElement;

	$effect(() => {
		// new Grid(gridDiv, gridOptions);
		const gridOptions = {
			columnDefs,
			rowData,
			...options
		};
		// Clear the gridDiv before creating a new grid
		gridDiv.innerHTML = '';
		createGrid(gridDiv, gridOptions);
	});
</script>

<div bind:this={gridDiv} class="ag-theme-alpine" style={styleStr}></div>
