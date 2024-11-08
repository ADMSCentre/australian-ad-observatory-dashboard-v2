<script lang="ts">
	import { getAuthState } from '$lib/api/auth.svelte';
	import { loginPath } from '$lib/routes.config';
	import { Circle } from 'svelte-loading-spinners';
	import ObserverOverview from './observer-overview.svelte';

	const auth = getAuthState();
	let data = $state();
	let loading = $state(false);

	$effect(() => {
		if (!auth.loading && !auth.currentUser) {
			location.href = loginPath;
		}
	});

	$effect(() => {
		const fetchData = async () => {
			if (!auth.currentUser) return;
			const url = 'https://f06kj1k332.execute-api.ap-southeast-2.amazonaws.com/dev/list-observers';
			loading = true;
			const res = await fetch(url, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${auth.currentUser.token}`
				},
				mode: 'cors'
			});
			const responseJson = await res.json();
			data = responseJson.data.map((observerId: string) => observerId.replace('/', ''));
			loading = false;
		};
		fetchData();
	});
</script>

<div class="flex flex-col gap-8 p-4">
	<h1>Mobile Observations</h1>

	{#if loading}
		<div class="flex size-full items-center justify-center">
			<Circle size="200" color="black" />
		</div>
	{/if}

	{#if data}
		<div class="flex flex-wrap gap-4">
			{#each data as observerId}
				<ObserverOverview {observerId} />
			{/each}
		</div>
	{/if}
</div>
