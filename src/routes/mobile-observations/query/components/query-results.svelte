<script lang="ts">
	import type { RichAdData } from '$lib/api/session/ads/types';
	import DataExportForm from 'mobile-observations/components/data-export-form.svelte';
	import AdsBrowser from '../../components/ads-browser.svelte';
	import ObservationsTimeline from '../../components/observations-timeline.svelte';
	import { parseRawAdPaths } from '$lib/api/session/ads/ads-index';
	import ObserversTable from 'mobile-observations/components/observers-table.svelte';

	// const { adData }: { adData: RichAdData[] } = $props();
	const {
		queryResults
	}: {
		queryResults: string[];
	} = $props();

	let adData: RichAdData[] = $state([]);

	$effect(() => {
		if (queryResults) {
			adData = parseRawAdPaths(queryResults);
		}
	});
</script>

<div class="flex items-center justify-between">
	Found {adData.length} ads matching the query.
	<DataExportForm {adData} />
</div>
<ObservationsTimeline ads={adData} />
<ObserversTable ads={adData} />
<AdsBrowser ads={adData} syncQueryParams={false} open={false} />
