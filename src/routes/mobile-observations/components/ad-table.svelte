<script lang="ts">
	import { cleanRdo, getField } from '$lib/api/session/ads/rdo-helper';
	import type { RichDataObject } from '$lib/api/session/ads/rich-data-object-type';
	import { tabulateObject, type Table as TableObjectType } from '$lib/utils/tabulateJson';
	import Table from './table.svelte';

	let {
		richDataObject,
		selectedKeys,
		table = $bindable(),
		class: className = ''
	}: {
		richDataObject: RichDataObject;
		selectedKeys: string[];
		table?: TableObjectType;
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
</script>

<Table bind:table class={className} />
