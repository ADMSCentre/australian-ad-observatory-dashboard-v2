<script lang="ts">
	import { cleanRdo, getField } from '$lib/api/session/ads/rdo-helper';
	import type { RichDataObject } from '$lib/api/session/ads/rich-data-object-type';
	import AgGrid from '$lib/components/ag-grid/ag-grid.svelte';
	import { tabulateObject, type Table } from '$lib/utils/tabulateJson';
	import { twMerge } from 'tailwind-merge';
	let {
		richDataObject,
		selectedKeys,
		table = $bindable(),
		class: className = ''
	}: {
		richDataObject: RichDataObject;
		selectedKeys: string[];
		table?: Table;
		class?: string;
	} = $props();

	const cleanedRichDataObject = cleanRdo(richDataObject);

	$effect(() => {
		tabulateObject(
			cleanedRichDataObject,
			selectedKeys.map((k) => {
				const format = getField(k)?.format;
				return { key: k, format };
			})
		).then((t) => {
			table = t;
		});
	});

	const columnDefs = $derived.by(() => {
		return table?.columns.map((column) => {
			const shortKey = column.split('.').slice(-1)[0];
			return {
				headerName: getField(column)?.title || shortKey,
				field: column.replaceAll('.', '_')
			};
		});
	});
	const rowData = $derived.by(() => {
		return Object.entries(table?.rows || {}).map(([index, row]) =>
			table?.columns.reduce(
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
/>
