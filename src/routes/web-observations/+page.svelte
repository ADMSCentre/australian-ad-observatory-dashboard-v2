<script lang="ts">
	import { getAuthState } from '$lib/api/auth.svelte';
	import { useQueryApi, type QueryData } from '$lib/api/query.svelte';
	import { onMount } from 'svelte';
	import PlatformItem from './platform-item.svelte';
	import { Circle } from 'svelte-loading-spinners';
	import Button from '$lib/components/ui/button/button.svelte';
	import { loginPath } from '$lib/routes.config';
	const auth = getAuthState();

	$effect(() => {
		if (!auth.loading && !auth.currentUser) {
			location.href = loginPath;
		}
	});

	// TODO: Implement boolean filter
	let filters = $state({
		'0': {
			'0': {
				negation: true,
				index: [0, 0],
				'filter-type': 'demographics',
				'filter-subtype': 'gender',
				'filter-subtype-demographic': ['Male']
			}
		}
	});
	let paginationId = $state(0);

	let data = $state<QueryData | null>(null);
	// let presignedUrls = $derived(Object.entries(data?.presigned_urls || {}));
	let presignedUrls = $state<[string, string][]>([]);
	let loading = $state(false);

	$effect(() => {
		const executeQuery = async () => {
			if (!auth.currentUser) return;
			loading = true;
			const res = await useQueryApi({
				token: auth.currentUser.token,
				paginationId: paginationId,
				booleanFilterDataStructure: filters
			});
			data = res.data;
			presignedUrls = [...Object.entries(data?.presigned_urls || {}), ...presignedUrls];
			loading = false;
		};
		executeQuery();
	});
</script>

<!-- {#if presignedUrls.length > 0}
<PlatformItem itemId={presignedUrls[0][0]} presignedUrl={presignedUrls[0][1]} />
{/if} -->

<h1>Query</h1>

<p>
	I got the basics of loading images working, but I haven't figured out how the boolean filter works
	yet...
</p>

<p>
	Also it seems the pagination isn't working as expected as the same images are being loaded even
	when changing the pagination_id.
</p>

<div class="flex flex-col items-center gap-8 p-4">
	<div class="flex flex-wrap gap-4">
		{#each presignedUrls as [itemId, presignedUrl]}
			<PlatformItem {itemId} {presignedUrl} />
		{/each}
	</div>

	{#if loading}
		<div class="flex size-full items-center justify-center">
			<Circle size="200" color="black" />
		</div>
	{/if}

	<Button
		onclick={() => {
			paginationId += 1;
		}}
	>
		Load More
	</Button>
</div>
