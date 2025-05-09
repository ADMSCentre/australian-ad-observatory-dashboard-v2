<script lang="ts">
	import type { RichAdData } from '$lib/api/session/ads/types';
	import Button from '$lib/components/ui/button/button.svelte';
	import { DownloadIcon } from 'lucide-svelte';
	import ExportFieldsSelector from './export-fields-selector.svelte';
	import {
		attachRichDataObject,
		cleanRdo,
		FIELD_GROUPS,
		getField
	} from '$lib/api/session/ads/rdo-helper';
	import { session } from '$lib/api/session/session.svelte';
	import {
		getFields,
		type Table as TableObjectType,
		tabulateObject,
		toCsv,
		download
	} from '$lib/utils/tabulateJson';
	import AdTable from './ad-table.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { untrack } from 'svelte';
	import Table from './table.svelte';

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
		'observation.observed_on_device_at',
		'observation.platform',
		'enrichment.meta_adlibrary_scrape.candidates.data.ad_archive_id',
		'enrichment.meta_adlibrary_scrape.candidates.data.page_name',
		'enrichment.meta_adlibrary_scrape.candidates.data.start_date',
		'enrichment.meta_adlibrary_scrape.candidates.data.end_date',
		'enrichment.meta_adlibrary_scrape.candidates.data.currency',
		'enrichment.meta_adlibrary_scrape.candidates.data.impressions_with_index.impressions_text',
		'enrichment.meta_adlibrary_scrape.candidates.data.reach_estimate',
		'enrichment.meta_adlibrary_scrape.candidates.data.spend'
	]);

	$effect(() => {
		if (adData.length === 0) return;
		untrack(() => {
			session.ads.enrich(adData[0], ['richDataObject', 'attributes']).then(() => {
				const richDataObject = attachRichDataObject(adData[0]);
				if (!richDataObject) return;
				allKeys = getFields(richDataObject).leafKeys.map((k) => k.unindexed);
			});
		});
	});

	let loading = $state(false);
	const BATCH_SIZE = 500;
	const total = $derived(adData.length);
	let current = $state(0);
	let progress = $derived(+((current / total) * 100).toFixed(2));

	let tables = $state<TableObjectType[]>([]);
	const fullTable = $derived.by(() => {
		const joinedRows = tables.map((t) => t.rows).flat();
		const joinedTable: TableObjectType = {
			...tables[0],
			rows: joinedRows
		};
		return joinedTable;
	});

	const tabulateAd = async (ad: RichAdData) => {
		await session.ads.enrich(ad, ['richDataObject', 'attributes']);
		const richDataObject = attachRichDataObject(ad);
		if (!richDataObject) return;
		return tabulateObject(
			richDataObject,
			selectedKeys.map((k) => {
				const format = getField(k)?.format;
				return { key: k, format };
			})
		);
	};

	let eta = $state(0);
	const formattedEta = $derived.by(() => {
		if (eta <= 0) return '00:00';
		const minutes = Math.floor(eta / 60000)
			.toString()
			.padStart(2, '0');
		const seconds = Math.floor((eta % 60000) / 1000)
			.toString()
			.padStart(2, '0');
		return `${minutes}:${seconds}`;
	});

	const startExport = async () => {
		loading = true;
		tables = [];
		// Increment the current on an interval to provide some feedback to the user
		let timePerBatch = 20000;
		const refreshEta = () => {
			eta = (total - current) * (timePerBatch / BATCH_SIZE);
		};
		const elapses = [];
		let interval: ReturnType<typeof setInterval> | null = null;
		const refreshInterval = () => {
			refreshEta();
			if (interval) clearInterval(interval);
			interval = setInterval(() => {
				eta -= 1000;
			}, 1000);
		};
		refreshInterval();

		// Fetch the tables one by one to avoid overloading the server
		for (let i = 0; i < adData.length; i += BATCH_SIZE) {
			const batch = adData.slice(i, i + BATCH_SIZE);
			const startTime = Date.now();
			const enrichedAds = await session.ads.getEnrichedData(
				batch,
				['richDataObject', 'attributes'],
				{
					updateMemoryCache: false
				}
			);
			if (!enrichedAds) {
				loading = false;
				if (interval) clearInterval(interval);
				console.error('Failed to fetch enriched ads');
				return;
			}
			const batchTables = await Promise.all(
				enrichedAds?.map((ad) => {
					const richDataObject = attachRichDataObject(ad);
					console;
					if (!richDataObject) return;
					return tabulateObject(
						richDataObject,
						selectedKeys.map((k) => {
							const format = getField(k)?.format;
							return { key: k, format };
						})
					);
				})
			);
			// const batchTables = await Promise.all(batch.map(tabulateAd));
			tables = [...tables, ...batchTables.filter((t) => t !== undefined)];
			current = i + BATCH_SIZE;
			const endTime = Date.now();
			elapses.push(endTime - startTime);
			timePerBatch = Math.floor(elapses.reduce((a, b) => a + b, 0) / elapses.length);
			refreshInterval();
		}
		if (interval) clearInterval(interval);
		loading = false;
		current = 0;
		console.log('Completed fetching tables');

		const joinedRows = tables.map((t) => t.rows).flat();
		const joinedTable: TableObjectType = {
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
				Exporting... <span class="font-mono">{formattedEta}</span>
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
			<ExportFieldsSelector {allKeys} bind:selectedKeys disabled={loading} />
			<span class="text-lg font-semibold">Preview</span>
			{#if !loading || tables.length == 0}
				<AdTable richDataObject={attachRichDataObject(adData[0])} {selectedKeys} class="h-72" />
			{:else}
				<Table table={fullTable} />
			{/if}
			<div class="flex w-full gap-4">
				<Button onclick={startExport} disabled={loading}>
					<DownloadIcon />
					Export data
				</Button>
				{#if loading}
					<div class="flex w-full items-center gap-2">
						<span class="text-nowrap">Data export in progress...</span>
						<Progress value={progress} />
						<span>{progress.toFixed(2)}%</span>
					</div>
				{/if}
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
