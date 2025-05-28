<script lang="ts">
	import { getField } from '$lib/api/session/ads/rdo-description';
	import AgGrid from '$lib/components/ag-grid/ag-grid.svelte';
	import type { Table } from '$lib/utils/tabulateJson';
	import { twMerge } from 'tailwind-merge';

	let {
		table = $bindable(),
		class: className = ''
	}: {
		table?: Table;
		class?: string;
	} = $props();

	const columnDefs = $derived.by(() => {
		return table?.columns?.map((column) => {
			const shortKey = column.split('.').slice(-1)[0];
			return {
				headerName: getField(column)?.title || shortKey,
				field: column.replaceAll('.', '_')
			};
		});
	});
	const rowData = $derived.by(() => {
		return Object.entries(table?.rows || {}).map(([index, row]) =>
			table?.columns?.reduce(
				(acc, column) => {
					acc[column.replaceAll('.', '_')] = row[column];
					return acc;
				},
				{} as { [key: string]: any }
			)
		);
	});
</script>

<AgGrid
	{columnDefs}
	{rowData}
	pagination
	paginationAutoPageSize
	style={{
		width: '100%'
	}}
	class={twMerge('h-96', className)}
	downloadable={false}
/>
