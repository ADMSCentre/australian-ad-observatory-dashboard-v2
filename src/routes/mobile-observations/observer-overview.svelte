<script lang="ts">
	import { getAuthState } from '$lib/api/auth.svelte';
	import type { QuickAccessCache } from './types';
	const auth = getAuthState();

	const { observerId } = $props();
	let data = $state<{
		[key: string]: string[];
	} | null>(null);

	$effect(() => {
		const fetchData = async () => {
			if (!auth.currentUser) return;
			const url = `https://f06kj1k332.execute-api.ap-southeast-2.amazonaws.com/dev/get-access-cache?observer_id=${observerId}`;
			const res = await fetch(url, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${auth.currentUser.token}`
				},
				mode: 'cors'
			});
			const responseJson = await res.json();
			const raw_data: QuickAccessCache = responseJson;
			data = {
				Observations: raw_data.data.observations,
				Ads: raw_data.data.ads,
				'Ads Passed OCR': raw_data.data.ads_passed_ocr,
				'Ads Passed Ad Scrape': raw_data.data.ads_passed_ad_scrape,
				'Ads Passed Mass Download': raw_data.data.ads_passed_mass_download
			};
		};
		fetchData();
	});
</script>

<div class="flex w-80 flex-col rounded bg-white p-4 shadow">
	<span class="w-fit rounded bg-gray-300 px-2 text-xs">{observerId}</span>
	{#if data}
		<div class="flex flex-col gap-2">
			<ul class="list-disc pl-4">
				{#each Object.entries(data) as [key, value]}
					<li class="text-sm">{key}: {value.length}</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
