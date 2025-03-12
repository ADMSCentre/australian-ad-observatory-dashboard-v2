<script lang="ts">
	import { FIELD_GROUPS, getField } from '$lib/api/session/ads/rdo-helper';
	import type { RichDataObject } from '$lib/api/session/ads/rich-data-object-type';
	import Accordion from '$lib/components/accordion/accordion.svelte';
	import AgGrid from '$lib/components/ag-grid/ag-grid.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import {
		createTableFromFields,
		getFields,
		tabulateObject,
		toCsv,
		type Table
	} from '$lib/utils/tabulateJson';
	import { ChevronRight, DownloadIcon } from 'lucide-svelte';
	import { twMerge } from 'tailwind-merge';
	import ExportFieldsSelector from '../export-fields-selector.svelte';
	import AdTable from '../ad-table.svelte';
	const { richDataObject }: { richDataObject: RichDataObject } = $props();

	const cleanedRichDataObject = (() => {
		const getCandidateRanking = (index: number) => {
			const ranking = richDataObject.enrichment.meta_adlibrary_scrape.rankings.find(
				(r) => r.this_selected_candidate_i === index
			);
			return ranking;
		};

		// Remove irrelevant fields from the richDataObject
		const cleanedRichDataObject = { ...richDataObject } as any;

		delete cleanedRichDataObject.enrichment.meta_adlibrary_scrape.comparisons;
		delete cleanedRichDataObject.media;
		delete cleanedRichDataObject.observation.whitespace_derived_signature;

		// Join the candidates with their rankings
		cleanedRichDataObject.enrichment.meta_adlibrary_scrape.candidates.forEach(
			(candidate: any, index: number) => {
				const ranking = getCandidateRanking(index);
				candidate.ranking = ranking;
			}
		);

		return cleanedRichDataObject;
	})();

	const allFields = $derived(getFields(cleanedRichDataObject));

	const EXAMPLE_FIELDS = ['observer.uuid', 'observation.uuid', 'observation.observed_on_device_at'];

	let selectedKeys = $state<string[]>(EXAMPLE_FIELDS);

	let table = $state<Table>();

	const downloadCsv = async () => {
		if (!table) return;
		const csv = toCsv(table);
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'table.csv';
		a.click();
	};
</script>

<div class="flex flex-col gap-4">
	<div>
		<span class="text-2xl font-semibold">Available Fields</span>
		<p class="text-muted-foreground">Select the fields you want to include in the table</p>
	</div>

	<ExportFieldsSelector
		allKeys={allFields.leafKeys.map(({ unindexed }) => unindexed)}
		bind:selectedKeys
	/>

	<AdTable {richDataObject} {selectedKeys} bind:table />

	<div class="flex w-full justify-end">
		<Button onclick={downloadCsv}>
			<DownloadIcon />
			Download CSV
		</Button>
	</div>
</div>

<!-- <CodeMirror
	value={JSON.stringify(createTable(acceptedFields), null, 2)}
	lineWrapping
	useTab={false}
	lang={json()}
/>

<p>
	Fields: {acceptedFields.length}
</p>

<CodeMirror
	value={JSON.stringify(acceptedFields, null, 2)}
	lineWrapping
	useTab={false}
	lang={json()}
/> -->
