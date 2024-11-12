<script lang="ts">
	import { getAuthState } from '$lib/api/auth.svelte';
	import { listAdsForObserver, type ObservationIndex } from '$lib/api/mobile-observations';
	import type { QuickAccessCache } from '../types';
	const auth = getAuthState();

	const {
		observerId
	}: {
		observerId: string;
	} = $props();
	let data = $state<ObservationIndex | null>(null);

	$effect(() => {
		const fetchData = async () => {
			if (!auth.currentUser) return;
			data = await listAdsForObserver(auth.currentUser.token, observerId);
			console.log(data);
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
