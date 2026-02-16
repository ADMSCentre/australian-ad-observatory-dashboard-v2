<script lang="ts">
	import { parseRawAdPaths } from '$lib/api/session/ads/ads-index';
	import type { QueryState } from '$lib/api/session/query/index.svelte';
	import { session } from '$lib/api/session/session.svelte';
	import { LoaderIcon, AlertTriangle, ChevronRight } from 'lucide-svelte';
	import AdsBrowser from 'mobile-observations/components/ads-browser.svelte';
	import type { Query } from 'mobile-observations/query/query';
	import { onMount } from 'svelte';
	import Progress from '$lib/components/ui/progress/progress.svelte';
	import { Button } from '$lib/components/ui/button';

	// Props
	type RelatedObservationsProps = {
		relatedObservationIds: string[];
	};

	const { relatedObservationIds }: RelatedObservationsProps = $props();

	const query = $derived.by<Query>(() => {
		return {
			method: 'OBSERVATION_ID_CONTAINS',
			args: relatedObservationIds.map((i) => {
				// Take only the last 8 characters of the observation ID, which are unique enough for this query and make it more readable
				return i.slice(-8);
			})
		};
	});

	let queryResponse = $state<{
		loading: boolean;
		error: boolean;
		message?: string;
		response?: QueryState;
	}>({
		loading: false,
		error: false
	});

	async function runQuery() {
		queryResponse = {
			loading: true,
			error: false
		};

		try {
			// No pagination as there shouldn't be that many related observations, so no need for PIT
			const response = session.query.prepare(query, false);
			queryResponse = {
				get loading() {
					return response.running;
				},
				error: false,
				response: response
			};
			await response.fetch();
		} catch (e) {
			queryResponse = {
				loading: false,
				error: true,
				message:
					'An error has occurred: ' +
					(e instanceof Error ? e.message : JSON.stringify(e, null, 2)) +
					'. Try running the query again. If the error persists, please contact support.'
			};
		}
	}

	onMount(runQuery);

	const queryResults = $derived(queryResponse?.response?.paths ?? []);
	const ads = $derived.by(() => {
		if (queryResults) {
			const parsedAds = parseRawAdPaths(queryResults);
			return parsedAds;
		}
		return [];
	});
</script>

<!-- Query Results -->
{#if queryResponse?.loading}
	<div
		class="flex items-center gap-2 rounded border p-4 text-sm font-light text-zinc-500 dark:text-zinc-400"
	>
		<LoaderIcon class="size-4 animate-spin" />
		<span class="text-nowrap">Running query, please wait...</span>
		{#if queryResponse?.response?.total}
			<Progress max={queryResponse?.response?.total} value={ads.length} />
			<span class="text-nowrap">{ads.length} / {queryResponse?.response?.total}</span>
		{/if}
	</div>
{:else if queryResponse?.error}
	<div
		class="flex items-center gap-2 rounded border border-red-500 p-4 text-sm font-light text-red-500 dark:text-red-400"
	>
		{queryResponse.message}
	</div>
	<Button variant="outline" onclick={runQuery}>Retry</Button>
{:else if ads.length > 0}
	<AdsBrowser
		{ads}
		syncQueryParams={false}
		open
		params={{
			group: 'none'
		}}
		virtualised={false}
	/>
{/if}
