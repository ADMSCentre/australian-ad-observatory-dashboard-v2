<script lang="ts">
	import { parseRawAdPaths } from '$lib/api/session/ads/ads-index';
	import Accordion from '$lib/components/accordion/accordion.svelte';
	import { Button } from '$lib/components/ui/button';
	import { json } from '@codemirror/lang-json';
	import {
		Workflow,
		CodeIcon,
		ChevronRight,
		LoaderIcon,
		PlusIcon,
		AlertTriangle,
		SquareChevronDown
	} from 'lucide-svelte';
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
	import { getMethodByValue, type Query } from 'mobile-observations/query/query';
	import { getContext, untrack } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import CodeMirror from 'svelte-codemirror-editor';
	import { slide } from 'svelte/transition';
	import DataExportForm from 'mobile-observations/components/data-export-form.svelte';
	import VisualisationSelector from '../query-visualisation/visualisation-selector.svelte';
	import Visualisation from '../query-visualisation/visualisation.svelte';
	import { flip } from 'svelte/animate';
	import MultiSelect from '$lib/components/multi-select/multi-select.svelte';
	import { session } from '$lib/api/session/session.svelte';
	import { QueryModeSelector } from 'mobile-observations/query/query-modes.svelte';

	let { cell = $bindable() }: { cell: QueryCell } = $props();

	let editorModeSelector = $state(new QueryModeSelector());

	$effect(() => {
		const method = cell.content.query?.method;
		untrack(() => {
			editorModeSelector.setMethod(method);
		});
	});

	const projectManager = (getContext(PROJECT_MANAGER) as () => ProjectManager | undefined)();
	if (!projectManager)
		throw new Error(
			'Project Manager not found. This component must be rendered inside a ProjectPage component.'
		);

	// const queryResponse = $derived(projectManager.queryResults[cell.id]);

	const queryResponse = $derived(projectManager.queryResults[cell?.id]);
	const disabled = $derived(!projectManager.currentUser.isEditor || queryResponse?.loading);
	const queryResults = $derived(queryResponse?.response?.paths ?? []);
	$effect(() => {
		if (!cell.config) {
			cell.config = {
				hidden: false
			};
		}
	});

	function updateCell() {
		cell.hasChanges = true;
		// if (!projectManager) throw new Error('Project manager is not defined');
		// projectManager?.update();
	}

	const originalConfig = JSON.stringify(cell.config);

	// Whenever the config change, update the cell
	$effect(() => {
		if (JSON.stringify(cell.config) !== originalConfig) {
			updateCell();
		}
	});

	$inspect({ queryResponse, queryResults });

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
		updateCell();
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

		updateCell();

		newVisualisationType = null;
	}
</script>

<div
	class="group/cell relative flex max-w-full flex-col gap-2 overflow-x-auto overflow-y-hidden rounded border p-4 shadow"
>
	{#if editorModeSelector.currentMode.type === 'multi-select'}
		<div class="flex flex-col gap-2">
			<p class="text-sm font-light text-zinc-500 dark:text-zinc-400">
				Click on the field below to select items for the query <span class="font-normal"
					>{getMethodByValue(cell.content.query.method).label}</span
				>.
			</p>
			<MultiSelect
				options={session.observers.activationCodes.map((code) => ({
					value: code,
					label: code
				}))}
				selected={cell.content.query.args}
				placeholder="Select observers"
				onSelected={(selected) => {
					cell.content.query.args = selected;
					updateCell();
				}}
				{disabled}
				searchable
				clearable
				allowPasting
			/>
		</div>
	{/if}
	{#if editorModeSelector.currentMode.type === 'visual'}
		<QueryBuilder
			bind:query={cell.content.query}
			class="border-none p-0"
			onchange={() => {
				updateCell();
			}}
			{disabled}
		/>
	{/if}
	{#if editorModeSelector.currentMode.type === 'text'}
		<QueryTextEditor
			bind:query={cell.content.query}
			class="text-lg"
			onsaved={() => {
				updateCell();
			}}
			{disabled}
		/>
	{/if}
	<!-- Query controls -->
	<div class="sticky left-0 flex w-full items-end justify-between gap-2">
		<Button
			class={twMerge(
				'-m-4 size-fit gap-0 rounded-none rounded-bl-sm bg-muted-foreground p-0 pr-1 text-xs font-light leading-none opacity-0 transition-opacity group-hover/cell:opacity-100 ',
				hidden && 'opacity-100'
			)}
			onclick={() => {
				setHidden(!hidden);
			}}
		>
			{#if !queryResponse?.loading}
				<ChevronRight class={twMerge('size-3 transition', !hidden ? 'rotate-90 transform' : '')} />
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
		<div class="flex w-full items-center justify-end gap-2">
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

<!-- Query results -->
{#if queryResults}
	<ul class="relative list-inside list-disc rounded-b-sm bg-zinc-500/5 px-4">
		<!-- {#each results as result}
		<li>{result.type} - {result.id}</li>
	{/each} -->

		{#if !hidden}
			<div class="flex flex-col gap-4 py-4" transition:slide={{ axis: 'y' }}>
				{#if queryResponse?.loading}
					<div class="flex items-center gap-2 text-sm font-light text-zinc-500 dark:text-zinc-400">
						<LoaderIcon class="size-4 animate-spin" />
						Running query
						{#if queryResponse?.response?.total}
							({ads.length} / {queryResponse?.response?.total} loaded)
						{/if}
						, please wait...
					</div>
				{:else if queryResponse?.error}
					<div class="flex items-center gap-2 text-sm font-light text-red-500 dark:text-red-400">
						<AlertTriangle class="size-4" />
						{queryResponse.message}
					</div>
				{/if}

				{#if !queryResponse?.loading && queryResults && !queryResponse?.error}
					<!-- <QueryResults {queryResults} /> -->

					<div class="flex items-center justify-between">
						Displaying {queryResponse?.response?.total} ads matching the query.
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
									updateCell();
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
				{/if}
			</div>
		{/if}
	</ul>
{/if}
