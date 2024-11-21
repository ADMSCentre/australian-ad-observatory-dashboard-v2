<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft } from 'lucide-svelte/icons';
	import AdCard from './ad-card.svelte';
	import ObserverOverview from './observer-overview.svelte';
	import { listAdsForObserver } from '$lib/api/mobile-observations';
	import { getAuthState } from '$lib/api/auth.svelte';
	import { Circle } from 'svelte-loading-spinners';
	import type { IndividualAdData } from './types';
	import AdsBrowser from '../components/ads-browser.svelte';
	import ObservationsTimeline from '../components/observations-timeline.svelte';
	import { withBase } from '$lib/utils';

	const participantId = $page.url.searchParams.get('observer_id') || '';
	const auth = getAuthState();

	let ads = $state<IndividualAdData[]>([]);

	const fetchAdsIndex = async () => {
		if (!auth.currentUser) return;
		ads = await listAdsForObserver(auth.currentUser.token, participantId);
	};

	$effect(() => {
		fetchAdsIndex();
	});
</script>

<!-- Back button -->

<div class="flex flex-col gap-4">
	<div>
		<Button href={withBase('/mobile-observations')}>
			<ArrowLeft />
			Back
		</Button>
	</div>
	<h1>{participantId}</h1>
	<!-- <ObserverOverview observerId={participantId} /> -->
	{#if ads}
		<ObservationsTimeline {ads} />
		<AdsBrowser
			{ads}
			cardOptions={{
				showObserver: false
			}}
		/>
	{:else}
		<div class="flex size-full items-center justify-center">
			<Circle size="200" color="black" />
		</div>
	{/if}
</div>
