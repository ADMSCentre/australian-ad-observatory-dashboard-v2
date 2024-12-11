<script lang="ts">
	import { getAuthState } from '$lib/api/auth.svelte';
	import { Circle } from 'svelte-loading-spinners';
	import { listAllAds } from '$lib/api/mobile-observations';
	import MobileObservationsDashboard from './mobile-observations-dashboard.svelte';
	import type { RichAdData } from './types';
	// import { parseAdsIndex } from './utils';
	const auth = getAuthState();
	let ads = $state<RichAdData[]>([]);
	let isLoading = $state(true);

	const fetchAdsIndex = async () => {
		if (!auth.token) return [];
		return await listAllAds(auth.token);
	};

	$effect(() => {
		(async () => {
			ads = await fetchAdsIndex();
			isLoading = false;
		})();
	});
</script>

<div class="flex flex-col gap-8 p-1 pb-0 sm:p-4">
	<h1>Mobile Observations</h1>

	<div>
		The following data is collected using the <a
			href="https://play.google.com/store/apps/details?id=com.adms.australianmobileadtoolkit"
			target="_blank"
			class="underline hover:text-blue-500"
			rel="noopener noreferrer">Australian Mobile Ad Toolkit</a
		>
		app.
	</div>

	{#if isLoading}
		<div class="flex size-full items-center justify-center">
			<Circle size="200" color="black" />
		</div>
	{:else if !ads || ads.length === 0}
		<div>No data available.</div>
	{:else}
		<MobileObservationsDashboard bind:ads />
	{/if}
</div>
