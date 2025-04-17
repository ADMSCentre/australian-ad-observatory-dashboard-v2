<script lang="ts">
	import { parseRawAdPaths } from '$lib/api/session/ads/ads-index';
	import Accordion from '$lib/components/accordion/accordion.svelte';
	import { Button } from '$lib/components/ui/button';
	import { json } from '@codemirror/lang-json';
	import { Workflow, CodeIcon, ChevronRight, LoaderIcon } from 'lucide-svelte';
	import { PROJECT_MANAGER, ProjectManager } from 'mobile-observations/projects/manager.svelte';
	import type { Cell, QueryCell, QueryResult } from 'mobile-observations/projects/types';
	import QueryBuilder from 'mobile-observations/query/components/query-builder.svelte';
	import QueryResults from 'mobile-observations/query/components/query-results.svelte';
	import QueryTextEditor from 'mobile-observations/query/components/query-text-editor.svelte';
	import type { Query } from 'mobile-observations/query/query';
	import { getContext } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import CodeMirror from 'svelte-codemirror-editor';

	let { cell = $bindable() }: { cell: QueryCell } = $props();

	let editorMode: 'visual' | 'text' = $state('visual');

	const projectManager = (getContext(PROJECT_MANAGER) as () => ProjectManager | undefined)();
	if (!projectManager)
		throw new Error(
			'Project Manager not found. This component must be rendered inside a ProjectPage component.'
		);

	// const queryResponse = $derived(projectManager.queryResults[cell.id]);

	let queryResults = $state<string[]>([]);
	const queryResponse = $derived(projectManager.queryResults[cell.id]);
	$effect(() => {
		queryResults = queryResponse?.response?.result ?? [];
	});
</script>

<div class="relative flex w-full flex-col gap-2 rounded border p-4 shadow">
	{#if editorMode === 'visual'}
		<QueryBuilder
			bind:query={cell.content.query}
			class="border-none p-0"
			onchange={() => {
				projectManager.update();
			}}
			disabled={!projectManager.currentUser.isEditor}
		/>
	{:else}
		<QueryTextEditor
			bind:query={cell.content.query}
			class="text-lg"
			onsaved={() => {
				projectManager.update();
			}}
			disabled={!projectManager.currentUser.isEditor}
		/>
	{/if}
	<!-- Query controls -->
	<div class="flex justify-end gap-2">
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
	</div>
</div>

<!-- Query results -->
<ul class="list-inside list-disc rounded-b-sm bg-zinc-500/5 px-4">
	<!-- {#each results as result}
		<li>{result.type} - {result.id}</li>
	{/each} -->
	{#if queryResults}
		<div class="flex flex-col gap-4 py-4">
			{#if !queryResponse?.loading && queryResults}
				<QueryResults {queryResults} />
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
						value={JSON.stringify(queryResults, null, 2)}
						readonly
						lang={json()}
						class="w-full"
						lineWrapping
						useTab={false}
					/>
				</Accordion>
			{:else}
				<div class="flex items-center gap-2 text-sm font-light text-zinc-500 dark:text-zinc-400">
					<LoaderIcon class="size-4 animate-spin" />
					Running query, please wait...
				</div>
			{/if}
		</div>
	{/if}
</ul>
