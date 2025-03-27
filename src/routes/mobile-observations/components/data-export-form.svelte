<script lang="ts">
	import type { RichAdData } from '$lib/api/session/ads/types';
	import Button from '$lib/components/ui/button/button.svelte';
	import { DownloadIcon } from 'lucide-svelte';
	import ExportFieldsSelector from './export-fields-selector.svelte';
	import { FIELD_GROUPS, getField } from '$lib/api/session/ads/rdo-helper';
	import { session } from '$lib/api/session/session.svelte';
	import { getFields, type Table, tabulateObject, toCsv, download } from '$lib/utils/tabulateJson';
	import AdTable from './ad-table.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';

	const { adData }: { adData: RichAdData[] } = $props();

	let allKeys = $state(
		FIELD_GROUPS.reduce((acc, group) => {
			group.fields.forEach((field) => {
				acc.push(field.key);
			});
			return acc;
		}, [] as string[])
	);
	let selectedKeys = $state<string[]>([
		'observer.uuid',
		'observation.uuid',
		'observation.observed_on_device_at'
	]);

	$effect(() => {
		session.ads.enrich(adData[0], ['richDataObject']).then(() => {
			const richDataObject = adData[0].richDataObject;
			if (!richDataObject) return;
			allKeys = getFields(richDataObject).leafKeys.map((k) => k.unindexed);
		});
	});

	let loading = $state(false);
	const BATCH_SIZE = 5;
	const total = $derived(adData.length);
	let current = $state(0);
	let progress = $derived(+((current / total) * 100).toFixed(2));

	let tables = $state<Table[]>([]);

	const tabulateAd = async (ad: RichAdData) => {
		await session.ads.enrich(ad, ['richDataObject']);
		const richDataObject = ad.richDataObject;
		if (!richDataObject) return;
		return tabulateObject(
			richDataObject,
			selectedKeys.map((k) => {
				const format = getField(k)?.format;
				return { key: k, format };
			})
		);
	};

	const startExport = async () => {
		loading = true;
		// Fetch the tables one by one to avoid overloading the server
		for (let i = 0; i < adData.length; i += BATCH_SIZE) {
			// const ad = adData[i];
			// const table = await tabulateAd(ad);
			const batch = adData.slice(i, i + BATCH_SIZE);
			const batchTables = await Promise.all(batch.map(tabulateAd));
			tables = [...tables, ...batchTables.filter((t) => t !== undefined)];
			current = i + BATCH_SIZE;
		}
		loading = false;
		console.log('Completed fetching tables');

		const joinedRows = tables.map((t) => t.rows).flat();
		const joinedTable: Table = {
			...tables[0],
			rows: joinedRows
		};
		const csv = toCsv(joinedTable);
		download(csv);
	};
</script>

<Dialog.Root>
	<Dialog.Trigger>
		<Button>
			<DownloadIcon />
			{#if loading}
				Exporting... {progress}%
			{:else}
				Export data
			{/if}
		</Button>
	</Dialog.Trigger>
	<Dialog.Content class="max-h-screen max-w-screen-lg overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Export Data</Dialog.Title>
		</Dialog.Header>
		<div class="flex flex-col gap-4">
			<ExportFieldsSelector {allKeys} bind:selectedKeys />
			<span class="text-lg font-semibold">Preview</span>
			<AdTable richDataObject={adData[0].richDataObject} {selectedKeys} class="h-72" />
			<div class="flex w-full gap-4">
				<Button onclick={startExport} disabled={loading}>
					<DownloadIcon />
					Export data
				</Button>
				{#if loading}
					<div class="flex w-full items-center gap-2">
						<span class="text-nowrap">Data export in progress...</span>
						<Progress value={progress} />
						<span>{progress}%</span>
					</div>
				{/if}
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
