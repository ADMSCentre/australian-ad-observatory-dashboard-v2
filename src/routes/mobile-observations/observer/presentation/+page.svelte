<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft, Square } from 'lucide-svelte/icons';
	import AdCard from '../ad-card.svelte';
	import { listAdsForObserver } from '$lib/api/mobile-observations';
	import { getAuthState } from '$lib/api/auth.svelte';
	import { Circle } from 'svelte-loading-spinners';
	import type { BasicAdData, RichAdData } from '../types';
	import AdsBrowser from '../../components/ads-browser.svelte';
	import ObservationsTimeline from '../../components/observations-timeline.svelte';
	import { withBase } from '$lib/utils';

	const participantId = $page.url.searchParams.get('observer_id') || '';
	const auth = getAuthState();

	let ads = $state<RichAdData[]>([]);
	const filters = [(ad: RichAdData) => !ad.attributes?.hidden?.value];

	const fetchAdsIndex = async () => {
		if (!auth.token) return [];
		return await listAdsForObserver(auth.token, participantId, ['attributes'], filters);
	};

	$effect(() => {
		(async () => {
			ads = await fetchAdsIndex();
		})();
	});
</script>

<!-- Back button -->

<div class="flex flex-col gap-4">
	<div class="sticky top-0 z-50 flex justify-between">
		<Button href={withBase('/mobile-observations')}>
			<ArrowLeft />
			Back
		</Button>
		<Button href={withBase(`/mobile-observations/observer?observer_id=${participantId}`)}>
			<Square />
			Exit Presentation
		</Button>
	</div>
	<h1>{participantId}</h1>
	<!-- <ObserverOverview observerId={participantId} /> -->
	{#if !ads || ads.length === 0}
		<div class="flex size-full items-center justify-center">
			<Circle size="200" color="black" />
		</div>
	{:else}
		<ObservationsTimeline {ads} />
		<AdsBrowser
			bind:ads
			{filters}
			open
			cardOptions={{
				showObserver: false
			}}
		/>
	{/if}
</div>
