<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { Play } from 'lucide-svelte';
	import QueryBuilder from './components/query-builder.svelte';
	import treeToString, { buildTree } from './utils/query-builder';
	import { Circle } from 'svelte-loading-spinners';
	import QueryTextEditor from './components/query-text-editor.svelte';
	import CodeMirror from 'svelte-codemirror-editor';
	import { json } from '@codemirror/lang-json';
	import { onMount } from 'svelte';
	import { type Query } from './const';

	let queryObj = $state<Query>({
		method: 'MATCH',
		args: ['cats']
	});
	let queryResult = $state<unknown | null>(null);
	let isLoading = $state(false);

	const queryStr = $derived.by(() => {
		const str = treeToString(queryObj).replace(/^\((.*)\)$/, '$1');
		return str;
	});

	onMount(() => {
		// Parse the query from the URL when the component mounts
		const urlParams = new URLSearchParams(window.location.search);
		const query = urlParams.get('q');
		if (query) {
			queryObj = buildTree(query);
		}
	});

	$effect(() => {
		window.history.replaceState(null, '', `?q=${encodeURIComponent(queryStr)}`);
	});

	const queryJson = $derived.by(() => {
		return JSON.stringify(queryObj, null, 2);
	});

	const executeQuery = async () => {
		isLoading = true;
		// This is where the fetch request will be made...
		await new Promise((resolve) => setTimeout(resolve, 1000));
		queryResult = JSON.stringify(queryObj, null, 2);

		isLoading = false;
	};
</script>

<div class="flex flex-col gap-4 rounded border p-4">
	<h3>Query</h3>
	<div class="flex max-w-full flex-col gap-2">
		<QueryTextEditor bind:query={queryObj} class="text-lg" />
		<QueryBuilder bind:query={queryObj} />
	</div>
	<div>
		<strong>Query JSON (readonly):</strong>
		<!-- <pre>{queryJson}</pre> -->
		<CodeMirror
			value={queryJson}
			readonly
			class="w-full"
			lineWrapping
			useTab={false}
			lang={json()}
		/>
	</div>
	<Button class="w-24" onclick={executeQuery} disabled={isLoading}>
		{#if isLoading}
			<Circle size={20} color="white" />
		{:else}
			<Play />
		{/if}
		<span>Run</span>
	</Button>
	{#if queryResult}
		<div class="flex flex-col gap-2">
			<strong>Results:</strong>
			<CodeMirror
				value={queryResult as string}
				readonly
				lang={json()}
				class="w-full"
				lineWrapping
				useTab={false}
			/>
		</div>
	{/if}
</div>
