<script lang="ts">
	import type { RichAdData } from '$lib/api/session/ads/types';
	import DataExportForm from 'mobile-observations/components/data-export-form.svelte';
	import AdsBrowser from '../../components/ads-browser.svelte';
	import ObservationsTimeline from '../../components/observations-timeline.svelte';

	const { adData }: { adData: RichAdData[] } = $props();
</script>

<div class="flex items-center justify-between">
	Found {adData.length} ads matching the query.
	<DataExportForm {adData} />
</div>
<ObservationsTimeline ads={adData} />
<AdsBrowser ads={adData} syncQueryParams={false} open={false} />
