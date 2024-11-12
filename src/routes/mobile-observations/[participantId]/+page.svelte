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
	import { loginPath } from '$lib/routes.config';

	const { participantId } = $page.params;
	const auth = getAuthState();
	$effect(() => {
		if (!auth.loading && !auth.currentUser) {
			location.href = loginPath;
		}
	});

	let ads = $state<null | [string, IndividualAdData[]][]>(null);

	const fetchAdsIndex = async () => {
		if (!auth.currentUser) return;
		const index = await listAdsForObserver(auth.currentUser.token, participantId);

		const adsIndex = index['ads']
			.map((ad) => {
				// Convert timestamp to date (DD/MM/YYYY) and time (HH:MM:SS.SSS)
				const date = new Date(+ad.timestamp).toLocaleDateString('en-US', {
					month: 'long',
					day: 'numeric',
					year: 'numeric'
				});
				const time = new Date(+ad.timestamp).toLocaleTimeString('en-GB', {
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit',
					fractionalSecondDigits: 3
				});
				return {
					...ad,
					timestamp: +ad.timestamp,
					date,
					time
				};
			})
			.toSorted((a, b) => b.timestamp - a.timestamp);

		// Group ads by date
		const groupedAds = adsIndex.reduce(
			(
				acc: {
					[key: string]: IndividualAdData[];
				},
				ad
			) => {
				if (!acc[ad.date]) acc[ad.date] = [];
				acc[ad.date].push(ad);
				return acc;
			},
			{}
		);
		// Convert to entries, sort by date
		const adsEntries = Object.entries(groupedAds).toSorted(
			([a], [b]) => new Date(b).getTime() - new Date(a).getTime()
		);
		ads = adsEntries;
	};

	$effect(() => {
		fetchAdsIndex();
	});
</script>

<!-- Back button -->

<div class="flex flex-col gap-4">
	<div>
		<Button href="/mobile-observations">
			<ArrowLeft />
			Back
		</Button>
	</div>
	<h1>{participantId}</h1>
	<!-- <ObserverOverview observerId={participantId} /> -->
	{#if ads}
		<div class="relative flex flex-col gap-8">
			{#each ads as [date, adData]}
				<details open class="border-l-4">
					<summary
						class="sticky top-0 z-10 w-full cursor-pointer border bg-white bg-opacity-50 p-2 text-lg font-semibold backdrop-blur-sm sm:top-14"
					>
						{date} ({adData.length} ad{adData.length > 1 ? 's' : ''})
					</summary>
					<div class="grid grid-cols-1 gap-4 p-2 sm:flex sm:flex-wrap sm:p-8 md:gap-8">
						{#each adData as adData}
							<AdCard {adData} />
						{/each}
					</div>
				</details>
			{/each}
		</div>
	{:else}
		<div class="flex size-full items-center justify-center">
			<Circle size="200" color="black" />
		</div>
	{/if}
</div>
