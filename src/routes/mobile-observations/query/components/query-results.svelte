<script lang="ts">
	import type { RichAdData } from '$lib/api/session/ads/types';
	import AdsBrowser from '../../components/ads-browser.svelte';
	import ObservationsTimeline from '../../components/observations-timeline.svelte';

	const { adData }: { adData: RichAdData[] } = $props();
</script>

<div>
	Found {adData.length} ads matching the query.
</div>
<ObservationsTimeline ads={adData} />
<AdsBrowser ads={adData} syncQueryParams={false} open />
