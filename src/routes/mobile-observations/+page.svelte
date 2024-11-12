<script lang="ts">
	import { getAuthState } from '$lib/api/auth.svelte';
	import { loginPath } from '$lib/routes.config';
	import { Circle } from 'svelte-loading-spinners';
	import ObserverOverview from './observer/observer-overview.svelte';
	import { listAllAds, type ObservationIndex } from '$lib/api/mobile-observations';
	import MobileObservationsDashboard from './mobile-observations-dashboard.svelte';
	import { parseAdsIndex } from './utils';
	import type { IndividualAdData } from './observer/types';

	const auth = getAuthState();
	let loading = $state(false);
	let data = $state<IndividualAdData[]>([]);

	const fetchAdsIndex = async () => {
		if (!auth.currentUser) return;

		loading = true;
		data = parseAdsIndex(await listAllAds(auth.currentUser.token));
		loading = false;
	};

	$effect(() => {
		if (!auth.loading && !auth.currentUser) {
			location.href = loginPath;
		}
	});

	$effect(() => {
		fetchAdsIndex();
	});
</script>

<div class="flex flex-col gap-8 p-4 pb-0">
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

	{#if loading}
		<div class="flex size-full items-center justify-center">
			<Circle size="200" color="black" />
		</div>
	{/if}

	{#if data.length}
		<MobileObservationsDashboard ads={data} />
	{/if}
</div>
