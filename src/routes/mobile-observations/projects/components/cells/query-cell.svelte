<script lang="ts">
	import { parseRawAdPaths } from '$lib/api/session/ads/ads-index';
	import Accordion from '$lib/components/accordion/accordion.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Button } from '$lib/components/ui/button';
	import { json } from '@codemirror/lang-json';
	import {
		AlertTriangle,
		ChevronRight,
		Clock3,
		FileJson,
		LoaderIcon,
		Monitor,
		Table,
		XIcon
	} from 'lucide-svelte';
	import { PROJECT_MANAGER, ProjectManager } from 'mobile-observations/projects/manager.svelte';
	import type {
		QueryCell,
		QueryResult,
		VISUALISATION_TYPES
	} from 'mobile-observations/projects/types';
	import QueryBuilder from 'mobile-observations/query/components/query-builder.svelte';
	import QueryTextEditor from 'mobile-observations/query/components/query-text-editor.svelte';
	import { getContext, untrack } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import CodeMirror from 'svelte-codemirror-editor';
	import { slide } from 'svelte/transition';
	import DataExportForm from 'mobile-observations/components/data-export-form.svelte';
	import VisualisationSelector from '../query-visualisation/visualisation-selector.svelte';
	import Visualisation from '../query-visualisation/visualisation.svelte';
	import MultiSelect from '$lib/components/multi-select/multi-select.svelte';
	import { session } from '$lib/api/session/session.svelte';
	import { QueryModeSelector } from 'mobile-observations/query/query-modes.svelte';
	import Progress from '$lib/components/ui/progress/progress.svelte';

	let { cell = $bindable() }: { cell: QueryCell } = $props();

	let editorModeSelector = $state(new QueryModeSelector());
	let newVisualisationType = $state<(typeof VISUALISATION_TYPES)[number] | null>(null);
	let activeVisualisationId = $state<string | null>(cell.content.results?.[0]?.id ?? null);
	let deleteVisualisationId = $state<string | null>(null);
	let draggedVisualisationId = $state<string | null>(null);
	let dragTargetVisualisationId = $state<string | null>(null);
	let dragTargetPlacement = $state<'before' | 'after' | null>(null);
	let suppressNextTabClick = $state(false);
	let deleteDialogOpen = $state(false);

	$effect(() => {
		const method = cell.content.query?.method;
		untrack(() => {
			editorModeSelector.setMethod(method);
		});
	});

	const projectManagerContext = (getContext(PROJECT_MANAGER) as () => ProjectManager | undefined)();
	if (!projectManagerContext)
		throw new Error(
			'Project Manager not found. This component must be rendered inside a ProjectPage component.'
		);
	const projectManager = projectManagerContext;

	const queryResponse = $derived(projectManager.queryResults[cell?.id]);
	const disabled = $derived(!projectManager.currentUser.isEditor || queryResponse?.loading);
	const queryResults = $derived(queryResponse?.response?.paths ?? []);

	function updateCell() {
		cell.hasChanges = true;
	}

	const originalConfig = JSON.stringify(cell.config);

	$effect(() => {
		if (JSON.stringify(cell.config) !== originalConfig) {
			updateCell();
		}
	});

	const ads = $derived.by(() => {
		if (queryResults) {
			return parseRawAdPaths(queryResults);
		}
		return [];
	});

	const displayTotal = $derived(queryResponse?.response?.total ?? ads.length);

	const activeVisualisation = $derived.by(() => {
		const results = cell.content.results ?? [];
		return results.find((result) => result.id === activeVisualisationId) ?? results[0] ?? null;
	});

	const visualisationMeta: Record<
		(typeof VISUALISATION_TYPES)[number],
		{ label: string; icon: any }
	> = {
		timeline: { label: 'Timeline', icon: Clock3 },
		'observer-table': { label: 'Observer Table', icon: Table },
		'ads-browser': { label: 'Ads Browser', icon: Monitor },
		raw: { label: 'Raw JSON', icon: FileJson }
	};

	$effect(() => {
		const results = cell.content.results ?? [];
		if (results.length === 0) {
			activeVisualisationId = null;
			return;
		}
		if (!activeVisualisationId || !results.some((result) => result.id === activeVisualisationId)) {
			activeVisualisationId = results[0].id;
		}
	});

	function addVisualisation(type: (typeof VISUALISATION_TYPES)[number] | null) {
		if (!type) return;
		if (!projectManager) throw new Error('Project manager is not defined');
		if (!cell.content.results) cell.content.results = [];

		const nextResult = {
			type,
			id: `visualisation-${type}-${cell.content.results.length}-${Date.now()}`,
			config: {
				open: true
			}
		} as QueryResult;

		cell.content.results.push(nextResult);
		activeVisualisationId = nextResult.id;
		updateCell();
	}

	function deleteVisualisation(resultId: string) {
		const indexToDelete = cell.content.results.findIndex((result) => result.id === resultId);
		if (indexToDelete !== -1) {
			cell.content.results.splice(indexToDelete, 1);
		}
		if (activeVisualisationId === resultId) {
			activeVisualisationId = cell.content.results[0]?.id ?? null;
		}
		updateCell();
	}

	function requestDeleteVisualisation(resultId: string) {
		deleteVisualisationId = resultId;
		deleteDialogOpen = true;
	}

	function confirmDeleteVisualisation() {
		if (!deleteVisualisationId) return;
		deleteVisualisation(deleteVisualisationId);
		deleteVisualisationId = null;
		deleteDialogOpen = false;
	}

	const pendingDeleteVisualisation = $derived.by(() => {
		const result = cell.content.results?.find((item) => item.id === deleteVisualisationId);
		if (!result) return null;
		return {
			...result,
			label: visualisationMeta[result.type].label
		};
	});

	function reorderVisualisation(sourceId: string, targetId: string, placement: 'before' | 'after') {
		if (sourceId === targetId) return;
		const sourceIndex = cell.content.results.findIndex((result) => result.id === sourceId);
		const targetIndex = cell.content.results.findIndex((result) => result.id === targetId);
		if (sourceIndex === -1 || targetIndex === -1) return;

		const [moved] = cell.content.results.splice(sourceIndex, 1);
		const adjustedTargetIndex = cell.content.results.findIndex((result) => result.id === targetId);
		const insertIndex = placement === 'after' ? adjustedTargetIndex + 1 : adjustedTargetIndex;
		cell.content.results.splice(insertIndex, 0, moved);
		updateCell();
	}

	function handleTabDragStart(event: DragEvent, resultId: string) {
		if (!projectManager.currentUser.isEditor) return;
		draggedVisualisationId = resultId;
		event.dataTransfer?.setData('text/plain', resultId);
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
		}
	}

	function updateDragTarget(event: DragEvent, targetId: string) {
		if (!projectManager.currentUser.isEditor) return;
		event.preventDefault();
		const target = event.currentTarget as HTMLElement;
		const targetRect = target.getBoundingClientRect();
		dragTargetVisualisationId = targetId;
		dragTargetPlacement =
			event.clientX > targetRect.left + targetRect.width / 2 ? 'after' : 'before';
	}

	function handleTabDrop(event: DragEvent, targetId: string) {
		event.preventDefault();
		const sourceId = event.dataTransfer?.getData('text/plain') || draggedVisualisationId;
		if (sourceId) {
			const placement = dragTargetPlacement ?? 'before';
			reorderVisualisation(sourceId, targetId, placement);
		}
		suppressNextTabClick = true;
		draggedVisualisationId = null;
		dragTargetVisualisationId = null;
		dragTargetPlacement = null;
		setTimeout(() => {
			suppressNextTabClick = false;
		}, 0);
	}

	function selectVisualisationTab(resultId: string) {
		if (suppressNextTabClick) {
			suppressNextTabClick = false;
			return;
		}
		activeVisualisationId = resultId;
	}

	const includeObservers: string[] = $derived.by(() => {
		const queryObj = cell.content.query;
		if (!queryObj) return [] as string[];
		const { method } = queryObj;
		if (method !== 'OBSERVER_ID_CONTAINS') return [] as string[];
		return session.observers.all.filter((observer) => {
			if (!queryObj || !queryObj.args || queryObj.args.length === 0) return false;
			return queryObj.args.some((arg) => {
				if (typeof arg === 'string') {
					return observer.includes(arg);
				}
				return false;
			});
		});
	});
</script>

<div class="flex flex-col gap-4">
	<div
		class="rounded-lg border border-border bg-muted/20 p-3 transition-colors focus-within:border-brand/60"
	>
		{#if editorModeSelector.currentMode.type === 'multi-select'}
			<div class="mb-3 flex flex-col gap-1">
				<p class="text-sm font-medium text-foreground">ACTIVATION CODES</p>
				<p class="text-xs leading-5 text-muted-foreground">
					Select activation codes for this query.
				</p>
			</div>
		{/if}

		{#if editorModeSelector.currentMode.type === 'multi-select'}
			<MultiSelect
				options={session.observers.activationCodes
					.filter((c) => c !== null)
					.map((c) => c.trim())
					.map((code) => ({
						value: code,
						label: code
					}))}
				selected={cell.content.query.args}
				placeholder="Select activation codes"
				onSelected={(selected) => {
					cell.content.query.args = selected;
					updateCell();
				}}
				{disabled}
				searchable
				clearable
				allowPasting
				caseSensitive={false}
				stripWhitespaces
			/>
		{/if}

		{#if editorModeSelector.currentMode.type === 'visual'}
			<QueryBuilder
				bind:query={cell.content.query}
				class="border-none bg-transparent p-0"
				onchange={() => {
					updateCell();
				}}
				{disabled}
			/>
		{/if}

		{#if editorModeSelector.currentMode.type === 'text'}
			<QueryTextEditor
				bind:query={cell.content.query}
				class="text-sm"
				onsaved={() => {
					updateCell();
				}}
				{disabled}
			/>
		{/if}

		<div
			class="mt-3 flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between"
		>
			<div class="flex flex-wrap items-center gap-1">
				{#each editorModeSelector.availableModes as mode (mode.type)}
					<Button
						variant={editorModeSelector.currentMode.type === mode.type ? 'secondary' : 'ghost'}
						size="sm"
						class="h-8 gap-1.5 px-2 text-xs"
						onclick={() => editorModeSelector.setMode(mode)}
						title={mode.tooltip}
					>
						<mode.icon class="size-4" />
						{mode.label}
					</Button>
				{/each}
			</div>

			<div class="flex items-center gap-2 text-xs text-muted-foreground">
				{#if queryResponse?.loading}
					<LoaderIcon class="size-3.5 animate-spin" />
					<span
						>Loading {ads.length}{queryResponse?.response?.total
							? ` / ${queryResponse.response.total}`
							: ''}</span
					>
				{:else}
					<span>
						Displaying <strong class="font-semibold text-foreground">{displayTotal}</strong> ads matching
						criteria.
					</span>
				{/if}
			</div>
		</div>
	</div>
	{#if queryResponse?.loading && queryResponse?.response?.total}
		<div class="flex min-w-52 items-center gap-2 text-xs text-muted-foreground">
			<Progress max={queryResponse.response.total} value={ads.length} />
			<span class="text-nowrap">{ads.length} / {queryResponse.response.total}</span>
		</div>
	{/if}
</div>

{#if queryResults}
	<div class="relative rounded-lg">
		<div class="flex flex-col gap-4 py-4" transition:slide={{ axis: 'y' }}>
			{#if queryResponse?.error}
				<div
					class="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
				>
					<AlertTriangle class="size-4" />
					{queryResponse.message}
				</div>
			{/if}

			{#if !queryResponse?.loading && queryResults && !queryResponse?.error}
				{#if cell.content.results?.length === 0}
					{#if projectManager.currentUser.isEditor}
						<div class="border-b border-border">
							<VisualisationSelector
								bind:selected={newVisualisationType}
								placeholder="+ New Visualisation"
								triggerClass="h-auto w-auto justify-start rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pb-2 text-sm font-medium text-muted-foreground shadow-none hover:border-brand hover:bg-transparent hover:text-foreground"
								contentClass="w-56"
								onSelected={() => {
									addVisualisation(newVisualisationType);
									newVisualisationType = null;
								}}
							/>
						</div>
					{/if}
					<div class="py-5">
						<span class="text-sm leading-5 text-muted-foreground">
							No visualisations are configured for this query.
						</span>
					</div>
				{:else}
					<div
						class="flex flex-col gap-3 border-b border-border sm:flex-row sm:items-end sm:justify-between"
					>
						<div class="flex min-w-0 flex-wrap items-end gap-x-6 gap-y-2 overflow-x-auto">
							{#each cell.content.results as result (result.id)}
								{@const meta = visualisationMeta[result.type]}
								<Tooltip.Provider>
									<Tooltip.Root>
										<Tooltip.Trigger>
											<div
												role="tab"
												tabindex="0"
												aria-selected={activeVisualisationId === result.id}
												draggable={projectManager.currentUser.isEditor}
												class={twMerge(
													'group/tab flex items-center gap-1 border-b-2 pb-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
													projectManager.currentUser.isEditor &&
														'cursor-grab active:cursor-grabbing',
													activeVisualisationId === result.id
														? 'border-brand text-foreground'
														: 'border-transparent text-muted-foreground hover:text-foreground',
													dragTargetVisualisationId === result.id &&
														draggedVisualisationId !== result.id &&
														'border-b-black bg-muted/30'
												)}
												ondragstart={(event) => handleTabDragStart(event, result.id)}
												ondragover={(event) => updateDragTarget(event, result.id)}
												ondragleave={() => {
													if (dragTargetVisualisationId === result.id) {
														dragTargetVisualisationId = null;
														dragTargetPlacement = null;
													}
												}}
												ondrop={(event) => handleTabDrop(event, result.id)}
												ondragend={() => {
													draggedVisualisationId = null;
													dragTargetVisualisationId = null;
													dragTargetPlacement = null;
												}}
												onclick={() => selectVisualisationTab(result.id)}
												onkeydown={(event) => {
													if (event.key === 'Enter' || event.key === ' ') {
														event.preventDefault();
														selectVisualisationTab(result.id);
													}
												}}
											>
												<meta.icon class="size-4" />
												<span class="text-nowrap text-sm font-medium">{meta.label}</span>
												{#if projectManager.currentUser.isEditor}
													<button
														type="button"
														draggable="false"
														class="ml-1 flex size-5 items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 group-hover/tab:opacity-100"
														aria-label={`Delete ${meta.label} visualisation`}
														title="Delete visualisation"
														onclick={(event) => {
															event.stopPropagation();
															requestDeleteVisualisation(result.id);
														}}
													>
														<XIcon class="size-3.5" />
													</button>
												{/if}
											</div>
										</Tooltip.Trigger>
										{#if projectManager.currentUser.isEditor}
											<Tooltip.Content>Drag to reorder visualisation tabs.</Tooltip.Content>
										{/if}
									</Tooltip.Root>
								</Tooltip.Provider>
							{/each}

							{#if projectManager.currentUser.isEditor}
								<VisualisationSelector
									bind:selected={newVisualisationType}
									placeholder="+ New Visualisation"
									triggerClass="h-auto w-auto justify-start rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pb-2 text-sm font-medium text-muted-foreground shadow-none hover:border-brand hover:bg-transparent hover:text-foreground"
									contentClass="w-56"
									onSelected={() => {
										addVisualisation(newVisualisationType);
										newVisualisationType = null;
									}}
								/>
							{/if}
						</div>

						{#if ads.length > 0}
							<div class="pb-2">
								<DataExportForm adData={ads} />
							</div>
						{/if}
					</div>

					<div class="pt-1">
						{#if activeVisualisation}
							<Visualisation
								type={activeVisualisation.type}
								{ads}
								{includeObservers}
								bind:config={activeVisualisation.config as Record<string, any>}
								allowDelete={false}
								showHeader={false}
								onDelete={() => {
									deleteVisualisation(activeVisualisation.id);
								}}
							/>
						{/if}
					</div>
				{/if}

				<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<Accordion>
						{#snippet summary(open)}
							<span
								class="flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
							>
								<FileJson class="size-4" />
								<span>View cell JSON</span>
								<ChevronRight
									class={twMerge('size-3.5 transition', open ? 'rotate-90 transform' : '')}
								/>
							</span>
						{/snippet}
						<CodeMirror
							value={JSON.stringify(cell, null, 2)}
							readonly
							lang={json()}
							class="mt-2 w-full overflow-hidden rounded-lg bg-background"
							lineWrapping
							useTab={false}
						/>
					</Accordion>
				</div>
			{/if}
		</div>
	</div>
{/if}

<Dialog.Root
	open={deleteDialogOpen}
	onOpenChange={(open) => {
		deleteDialogOpen = open;
		if (!open) {
			deleteVisualisationId = null;
		}
	}}
>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Delete visualisation?</Dialog.Title>
			<Dialog.Description>
				{#if pendingDeleteVisualisation}
					This will remove the {pendingDeleteVisualisation.label} tab from this query cell.
				{:else}
					This will remove the selected visualisation from this query cell.
				{/if}
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button
				variant="outline"
				onclick={() => {
					deleteDialogOpen = false;
					deleteVisualisationId = null;
				}}
			>
				Cancel
			</Button>
			<Button variant="destructive" onclick={confirmDeleteVisualisation}>Delete</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
