<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { ChevronRight, CodeIcon, Play, Workflow } from 'lucide-svelte';
	import QueryBuilder from './components/query-builder.svelte';
	import treeToString, { buildTree, queryToString } from './utils/query-builder';
	import { Circle } from 'svelte-loading-spinners';
	import QueryTextEditor from './components/query-text-editor.svelte';
	import CodeMirror from 'svelte-codemirror-editor';
	import { json } from '@codemirror/lang-json';
	import { type Query } from './const';
	import { theme } from '$lib/states/theme.svelte';
	import { session } from '$lib/api/session/session.svelte';
	import { parseRawAdPaths } from '$lib/api/session/ads/ads-index';
	import AdsBrowser from '../components/ads-browser.svelte';
	import Accordion from '$lib/components/accordion/accordion.svelte';
	import { twMerge } from 'tailwind-merge';
	import Timeline from '../components/timeline.svelte';
	import ObservationsTimeline from '../components/observations-timeline.svelte';
	import QueryResults from './components/query-results.svelte';

	let queryObj = $state<Query | null>(null);
	let promise = $state<Promise<unknown>>();
	let loading = $state(false);

	$effect(() => {
		// Parse the query from the URL when the component mounts
		const urlParams = new URLSearchParams(window.location.search);
		const query = urlParams.get('q');
		if (query) {
			queryObj = buildTree(query);
			return;
		}
		queryObj = {
			method: 'OBSERVER_ID_CONTAINS',
			args: []
		};
	});

	$effect(() => {
		if (!queryObj) return;
		// Remove the query from the URL before navigating away
		const queryStr = treeToString(queryObj).replace(/^\((.*)\)$/, '$1');
		window.history.replaceState(null, '', `?q=${encodeURIComponent(queryStr)}`);
	});

	const fetchData = async () => {
		await new Promise((resolve) => setTimeout(resolve, 1000));
		return JSON.stringify(queryObj, null, 2);
	};

	const executeQuery = () => {
		loading = true;
		// promise = fetchData().then((res) => {
		// 	loading = false;
		// 	return res;
		// });
		if (!queryObj) return;
		promise = session.ads.query(queryObj).then((res) => {
			loading = false;
			return res;
		});
	};

	let editorMode = $state<'visual' | 'text'>('visual');
</script>

{#if queryObj}
	<div class="flex flex-col gap-4 rounded border p-4">
		<div class="flex items-center justify-between gap-2">
			<h3>Query</h3>
			<div class="flex items-center gap-2">
				<span class="text-muted-foreground">Editor Mode:</span>
				<div class="flex">
					<Button
						variant={editorMode === 'visual' ? 'secondary' : 'ghost'}
						size="sm"
						onclick={() => (editorMode = 'visual')}
					>
						<Workflow />
						Visual
					</Button>
					<Button
						variant={editorMode === 'text' ? 'secondary' : 'ghost'}
						size="sm"
						onclick={() => (editorMode = 'text')}
					>
						<CodeIcon />
						Text
					</Button>
				</div>
				<Button class="w-24" onclick={executeQuery} disabled={loading}>
					{#if loading}
						<Circle size={20} color={theme.colors.background} />
					{:else}
						<Play />
					{/if}
					<span>Run</span>
				</Button>
			</div>
		</div>
		<div class="grid grid-cols-1 gap-4">
			<div class="flex w-full flex-col gap-2">
				<!-- <Button onclick={() => (editorMode = editorMode === 'visual' ? 'text' : 'visual')}>
					{editorMode === 'visual' ? 'Switch to Text' : 'Switch to Visual'}
				</Button> -->
				{#if editorMode === 'visual'}
					<QueryBuilder bind:query={queryObj} />
				{:else}
					<QueryTextEditor bind:query={queryObj} class="text-lg" />
				{/if}
			</div>
			<div class="">
				<Accordion>
					{#snippet summary(open)}
						<span
							class="flex w-fit items-center gap-1 bg-muted-foreground pl-1 pr-2 text-xs font-medium text-background"
						>
							<ChevronRight
								class={twMerge('size-3 transition', open ? 'rotate-90 transform' : '')}
							/>
							<strong>Query JSON (readonly)</strong>
						</span>
					{/snippet}
					<CodeMirror
						value={JSON.stringify(queryObj, null, 2)}
						readonly
						class="w-full"
						lineWrapping
						useTab={false}
						lang={json()}
					/>
				</Accordion>
				<!-- <pre>{queryJson}</pre> -->
			</div>
		</div>
		{#await promise then queryResult}
			<div class="flex flex-col gap-4">
				<strong>Results:</strong>
				{#if (queryResult as any)?.result}
					{@const adData = parseRawAdPaths((queryResult as any).result)}
					<QueryResults {adData} />
				{/if}
				<Accordion>
					{#snippet summary(open)}
						<span
							class="flex w-fit items-center gap-1 bg-muted-foreground pl-1 pr-2 text-xs font-medium text-background"
						>
							<ChevronRight
								class={twMerge('size-3 transition', open ? 'rotate-90 transform' : '')}
							/>
							JSON
						</span>
					{/snippet}
					<CodeMirror
						value={JSON.stringify(queryResult, null, 2)}
						readonly
						lang={json()}
						class="w-full"
						lineWrapping
						useTab={false}
					/>
				</Accordion>
			</div>
		{/await}
	</div>
{/if}
