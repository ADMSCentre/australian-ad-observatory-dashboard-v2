<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import {
		ArrowLeft,
		ChevronLeftCircle,
		ChevronLeftSquare,
		ChevronRightCircle,
		ChevronRightSquare,
		Presentation,
		Square
	} from 'lucide-svelte/icons';
	import AdCard from '../components/ad-card.svelte';
	import { listAdsForObserver } from '$lib/api/mobile-observations';
	import { getAuthState } from '$lib/api/auth.svelte';
	import { Circle } from 'svelte-loading-spinners';
	import type { BasicAdData, RichAdData } from '../types';
	import AdsBrowser from '../components/ads-browser.svelte';
	import ObservationsTimeline from '../components/observations-timeline.svelte';
	import { withBase } from '$lib/utils';
	import { twMerge } from 'tailwind-merge';

	const participantId = $page.url.searchParams.get('observer_id') || '';
	const auth = getAuthState();

	let ads = $state<RichAdData[]>([]);
	let isPresenting = $state(false);
	let isToolboxOpen = $state(true);
	const filters = $derived.by(() => {
		if (!isPresenting) return [];
		return [(ad: RichAdData) => !ad.attributes?.hidden?.value];
	});

	const fetchAdsIndex = async () => {
		if (!auth.token) return [];
		return await listAdsForObserver(auth.token, participantId);
	};

	$effect(() => {
		(async () => {
			ads = await fetchAdsIndex();
		})();
	});
</script>

<!-- Back button -->

<div class="flex flex-col gap-4">
	<div class="flex justify-between">
		<Button href={withBase('/mobile-observations')}>
			<ArrowLeft />
			Back
		</Button>
	</div>
	<div
		class={twMerge(
			'fixed bottom-2 right-2 z-[100] flex w-fit items-center border bg-white bg-opacity-50 px-4 py-2 shadow backdrop-blur-sm transition-all',
			isToolboxOpen ? 'translate-x-0' : 'translate-x-full'
		)}
	>
		<button
			onclick={() => (isToolboxOpen = !isToolboxOpen)}
			class="absolute left-0 -mr-2 -translate-x-1/2 rounded bg-white"
		>
			{#if isToolboxOpen}
				<ChevronRightSquare />
			{:else}
				<ChevronLeftSquare />
			{/if}
		</button>
		<Button
			onclick={() => (isPresenting = !isPresenting)}
			variant={isPresenting ? 'destructive' : 'outline'}
		>
			{#if isPresenting}
				<Square />
				Exit Presentation
			{:else}
				<Presentation />
				Present
			{/if}
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
