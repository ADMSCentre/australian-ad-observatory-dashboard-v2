<script lang="ts">
	import { onMount } from 'svelte';
	import { createGrid, type ColDef, type ColGroupDef } from 'ag-grid-community';
	import 'ag-grid-community/styles/ag-grid.css';
	import 'ag-grid-community/styles/ag-theme-alpine.css';

	const { columnDefs, rowData, style } = $props<{
		columnDefs: (ColDef | ColGroupDef)[];
		rowData: any[];
		style: { [key: string]: string };
	}>();

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
			rowData
		};
		// Clear the gridDiv before creating a new grid
		gridDiv.innerHTML = '';
		createGrid(gridDiv, gridOptions);
	});
</script>

<div bind:this={gridDiv} class="ag-theme-alpine" style={styleStr}></div>
