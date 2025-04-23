<script lang="ts">
	import { parseRawAdPaths } from '$lib/api/session/ads/ads-index';
	import Accordion from '$lib/components/accordion/accordion.svelte';
	import { Button } from '$lib/components/ui/button';
	import { json } from '@codemirror/lang-json';
	import { Workflow, CodeIcon, ChevronRight, LoaderIcon, PlusIcon } from 'lucide-svelte';
	import { PROJECT_MANAGER, ProjectManager } from 'mobile-observations/projects/manager.svelte';
	import type {
		Cell,
		QueryCell,
		QueryResult,
		VISUALISATION_TYPES
	} from 'mobile-observations/projects/types';
	import QueryBuilder from 'mobile-observations/query/components/query-builder.svelte';
	import QueryResults from 'mobile-observations/query/components/query-results.svelte';
	import QueryTextEditor from 'mobile-observations/query/components/query-text-editor.svelte';
	import type { Query } from 'mobile-observations/query/query';
	import { getContext } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import CodeMirror from 'svelte-codemirror-editor';
	import { slide } from 'svelte/transition';
	import DataExportForm from 'mobile-observations/components/data-export-form.svelte';
	import VisualisationSelector from '../query-visualisation/visualisation-selector.svelte';
	import Visualisation from '../query-visualisation/visualisation.svelte';
	import { flip } from 'svelte/animate';

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
	const disabled = $derived(!projectManager.currentUser.isEditor || queryResponse?.loading);
	$effect(() => {
		queryResults = queryResponse?.response?.result ?? [];
		if (!cell.config) {
			cell.config = {
				hidden: false
			};
		}
	});

	// Whenever the config change, update the cell
	$effect(() => {
		if (cell.config) {
			projectManager.update();
		}
	});

	const ads = $derived.by(() => {
		if (queryResults) {
			return parseRawAdPaths(queryResults);
		}
		return [];
	});

	const hidden = $derived(cell.config?.['hidden'] ?? false);
	function setHidden(value: boolean) {
		if (!cell.config) throw new Error('Cell config is not defined');
		if (!projectManager) throw new Error('Project manager is not defined');
		cell.config['hidden'] = value;
		projectManager.update();
	}

	let newVisualisationType = $state<(typeof VISUALISATION_TYPES)[number] | null>(null);
	function addVisualisation() {
		if (!newVisualisationType) return;
		if (!projectManager) throw new Error('Project manager is not defined');
		if (!cell.content.results) cell.content.results = [];
		cell.content.results.push({
			type: newVisualisationType,
			id: `visualisation-${cell.content.results.length}`,
			config: {
				open: true
			}
		} as QueryResult);

		projectManager.update();

		newVisualisationType = null;
	}
</script>

<div class="group/cell relative flex w-full flex-col gap-2 rounded border p-4 shadow">
	{#if editorMode === 'visual'}
		<QueryBuilder
			bind:query={cell.content.query}
			class="border-none p-0"
			onchange={() => {
				projectManager.update();
			}}
			{disabled}
		/>
	{:else}
		<QueryTextEditor
			bind:query={cell.content.query}
			class="text-lg"
			onsaved={() => {
				projectManager.update();
			}}
			{disabled}
		/>
	{/if}
	<!-- Query controls -->
	<div class="flex justify-between gap-2">
		<div>
			<Button
				class={twMerge(
					'absolute bottom-0 left-0 size-fit gap-0 rounded-none rounded-bl-sm bg-muted-foreground p-0 py-0.5 pr-1 text-xs font-light leading-none opacity-0 transition-opacity group-hover/cell:opacity-100 ',
					hidden && 'opacity-100'
				)}
				onclick={() => {
					setHidden(!hidden);
				}}
			>
				{#if !queryResponse?.loading}
					<ChevronRight
						class={twMerge('size-3 transition', !hidden ? 'rotate-90 transform' : '')}
					/>
				{/if}
				<span class="flex items-center gap-1">
					{#if queryResponse?.loading}
						<LoaderIcon class="ml-1 size-3 animate-spin" />
						(loading...)
					{:else if !hidden}
						Hide output
					{:else if hidden}
						Show {queryResults.length} results
					{/if}
				</span>
			</Button>
		</div>
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
{#if queryResults}
	<ul class="relative list-inside list-disc rounded-b-sm bg-zinc-500/5 px-4">
		<!-- {#each results as result}
		<li>{result.type} - {result.id}</li>
	{/each} -->

		{#if !hidden}
			<div class="flex flex-col gap-4 py-4" transition:slide={{ axis: 'y' }}>
				{#if !queryResponse?.loading && queryResults}
					<!-- <QueryResults {queryResults} /> -->

					<div class="flex items-center justify-between">
						Found {ads.length} ads matching the query.
						{#if ads.length > 0}
							<DataExportForm adData={ads} />
						{/if}
					</div>

					{#each cell.content.results as result, index (index)}
						<!-- <pre
							class="rounded-md bg-zinc-100 p-2 text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
							transition:slide={{ axis: 'y' }}>
							{JSON.stringify(result, null, 2)}
						</pre> -->
						<div transition:slide={{ axis: 'y', duration: 300 }} animate:flip={{ duration: 300 }}>
							<Visualisation
								type={result.type}
								{ads}
								bind:config={result.config as Record<string, any>}
								allowDelete={projectManager.currentUser.isEditor}
								onDelete={() => {
									// Find the index of the result to delete
									const indexToDelete = cell.content.results.findIndex((r) => r.id === result.id);
									if (indexToDelete !== -1) {
										// Remove the result from the array
										cell.content.results.splice(indexToDelete, 1);
									}
									projectManager.update();
								}}
							/>
						</div>
					{/each}

					<!-- New visualisation selector -->
					{#if projectManager.currentUser.isEditor}
						<div class="flex w-full items-center justify-center gap-2">
							<VisualisationSelector
								bind:selected={newVisualisationType}
								onSelected={addVisualisation}
							/>
						</div>
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
							value={JSON.stringify(cell, null, 2)}
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
{/if}
