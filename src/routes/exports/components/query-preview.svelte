<script lang="ts">
	import { parseRawAdPaths } from '$lib/api/session/ads/ads-index';
	import { Button } from '$lib/components/ui/button';
	import { LoaderIcon, AlertTriangle, Play, ChevronRight } from 'lucide-svelte';
	import Accordion from '$lib/components/accordion/accordion.svelte';
	import { twMerge } from 'tailwind-merge';
	import QueryBuilder from 'mobile-observations/query/components/query-builder.svelte';
	import QueryTextEditor from 'mobile-observations/query/components/query-text-editor.svelte';
	import { getMethodByValue, type Query } from 'mobile-observations/query/query';
	import { onMount, untrack } from 'svelte';
	import MultiSelect from '$lib/components/multi-select/multi-select.svelte';
	import { session } from '$lib/api/session/session.svelte';
	import { QueryModeSelector } from 'mobile-observations/query/query-modes.svelte';
	import Progress from '$lib/components/ui/progress/progress.svelte';
	import AdsBrowser from 'mobile-observations/components/ads-browser.svelte';
	import type { QueryState } from '$lib/api/session/query/index.svelte';
	import type { Emitter } from '$lib/utils/emitter';

	let editorModeSelector = $state(new QueryModeSelector());
	let adsBrowserOpen = $state(false);

	type QueryPreviewProps = {
		query: Query;
		editable?: boolean;
		onResultsChange?: (loadedAdCount: number, totalAdCount?: number) => void;
		onQueryChange?: (updatedQuery: Query) => void;
		emitter?: Emitter<'run-query'>; // Optional emitter to listen for external events that may require re-running the query (e.g., new data available)
	};

	let {
		query = $bindable(),
		editable = true,
		onQueryChange,
		onResultsChange,
		emitter
	}: QueryPreviewProps = $props();

	// Local query state management
	let queryResponse = $state<{
		loading: boolean;
		error: boolean;
		message?: string;
		response?: QueryState;
	}>({
		loading: false,
		error: false
	});

	$effect(() => {
		const method = query?.method;
		untrack(() => {
			editorModeSelector.setMethod(method);
		});
	});

	const queryResults = $derived(queryResponse?.response?.paths ?? []);
	const totalResults = $derived(queryResponse?.response?.total);

	const ads = $derived.by(() => {
		if (queryResults) {
			const parsedAds = parseRawAdPaths(queryResults);
			return parsedAds;
		}
		return [];
	});

	$effect(() => {
		if (onResultsChange) {
			onResultsChange(ads.length, totalResults);
		}
	});

	$effect(() => {
		if (onQueryChange) {
			// Somehow the console log is needed here to make sure this effect runs when query changes...
			console.log(query);
			onQueryChange(query);
		}
	});

	const isValidQuery = $derived.by(() => {
		const queryObj = query;
		return queryObj && queryObj.method && queryObj.args && queryObj.args.length > 0;
	});

	async function runQuery() {
		if (!isValidQuery) {
			queryResponse = {
				loading: false,
				error: true,
				message: 'Please build a valid query first'
			};
			return;
		}

		queryResponse = {
			loading: true,
			error: false
		};

		try {
			const response = session.query.prepare(query, true);
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

	onMount(() => {
		if (emitter) {
			const handleExternalRunTrigger = () => {
				runQuery();
			};
			emitter.on('run-query', handleExternalRunTrigger);
			return () => {
				emitter.off('run-query', handleExternalRunTrigger);
			};
		}
	});
</script>

<div class="flex flex-col gap-4">
	<div
		class="flex max-w-full flex-col gap-2 overflow-x-auto overflow-y-hidden rounded-md border-l-4 border-purple-500 bg-purple-500/[0.025] p-4"
	>
		{#if editorModeSelector.currentMode.type === 'multi-select'}
			<div class="flex flex-col gap-2">
				<p class="text-sm font-light text-zinc-500 dark:text-zinc-400">
					Click on the field below to select items for the query <span class="font-normal"
						>{getMethodByValue(query.method).label}</span
					>.
				</p>
				<MultiSelect
					options={session.observers.activationCodes
						.filter((c) => c !== null)
						.map((c) => c.trim())
						.map((code) => ({
							value: code,
							label: code
						}))}
					selected={query.args}
					placeholder="Select observers"
					onSelected={(selected) => {
						query.args = selected;
					}}
					disabled={!editable || queryResponse?.loading}
					searchable
					clearable
					allowPasting
					caseSensitive={false}
				/>
			</div>
		{/if}
		{#if editorModeSelector.currentMode.type === 'visual'}
			<QueryBuilder
				bind:query
				class="border-none p-0"
				disabled={!editable || queryResponse?.loading}
			/>
		{/if}
		{#if editorModeSelector.currentMode.type === 'text'}
			<QueryTextEditor bind:query class="text-lg" disabled={!editable || queryResponse?.loading} />
		{/if}

		<!-- Query controls -->
		<div class="flex w-full items-end justify-between gap-2">
			<Button onclick={runQuery} disabled={queryResponse?.loading || !isValidQuery}>
				{#if queryResponse?.loading}
					<LoaderIcon class="mr-2 size-4 animate-spin" />
					Running...
				{:else}
					<Play class="mr-2 size-4" />
					Run Query
				{/if}
			</Button>
			<div class="flex items-center gap-2">
				{#each editorModeSelector.availableModes as mode}
					<Button
						variant={editorModeSelector.currentMode.type === mode.type ? 'secondary' : 'ghost'}
						size="sm"
						onclick={() => editorModeSelector.setMode(mode)}
						title={mode.tooltip}
					>
						<mode.icon />
						{mode.label}
					</Button>
				{/each}
			</div>
		</div>
	</div>

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
			<AlertTriangle class="size-4" />
			{queryResponse.message}
		</div>
	{:else if ads.length > 0}
		<Accordion bind:open={adsBrowserOpen}>
			{#snippet summary(isOpen)}
				<span
					class="flex w-fit items-center gap-1 rounded-sm bg-muted px-2 py-1 text-sm font-medium hover:bg-muted/80"
				>
					<ChevronRight class={twMerge('size-4 transition', isOpen ? 'rotate-90 transform' : '')} />
					Preview Ads ({ads.length})
				</span>
			{/snippet}
			<div class="mt-4">
				<AdsBrowser {ads} syncQueryParams={false} />
			</div>
		</Accordion>
	{/if}
</div>
