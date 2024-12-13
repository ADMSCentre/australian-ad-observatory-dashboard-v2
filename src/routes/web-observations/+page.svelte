<script lang="ts">
	import { getAuthState } from '$lib/api/auth.svelte';
	import { useQueryApi, type QueryData } from '$lib/api/query.svelte';
	import PlatformItem from './platform-item.svelte';
	import { Circle } from 'svelte-loading-spinners';
	import Button from '$lib/components/ui/button/button.svelte';
	import { theme } from '$lib/states/theme.svelte';

	const auth = getAuthState();

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
	let presignedUrls = $state<[string, string][]>([]);
	let loading = $state(false);

	$effect.pre(() => {
		const executeQuery = async () => {
			if (!auth.token) return;
			loading = true;
			const res = await useQueryApi({
				token: auth.token,
				paginationId: paginationId,
				booleanFilterDataStructure: filters
			});
			const data = res.data;
			presignedUrls = [...Object.entries(data?.presigned_urls || {}), ...presignedUrls];
			loading = false;
		};
		executeQuery();
	});
</script>

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
			<Circle size="200" color={theme.colors.foreground} />
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
