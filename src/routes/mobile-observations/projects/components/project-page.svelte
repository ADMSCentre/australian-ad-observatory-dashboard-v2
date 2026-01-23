<script lang="ts">
	import {
		type Project,
		type TextCell as TextCellType,
		type QueryCell as QueryCellType
	} from '../types';
	import TextCell from './cells/text-cell.svelte';
	import QueryCell from './cells/query-cell.svelte';
	import ProjectHeader from './project-header.svelte';
	import CellControls from './cells/cell-controls.svelte';
	import { getContext, onDestroy, onMount, setContext, untrack } from 'svelte';
	import { PROJECT_MANAGER, ProjectManager } from '../manager.svelte';
	import { flip } from 'svelte/animate';
	import CellCreateMenu from './cells/cell-create-menu.svelte';
	import { auth } from '$lib/api/auth/auth.svelte';
	import { withBase } from '$lib/utils';
	import { ArrowLeft } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { twMerge } from 'tailwind-merge';
	import { session } from '$lib/api/session/session.svelte';
	import Cell from './cells/cell.svelte';
	import CreateExportDialog from '../../../exports/components/create-export-dialog.svelte';
	import { goto } from '$app/navigation';

	const { projectId }: { projectId: string } = $props();

	let manager = $state<ProjectManager | null>();
	onMount(() => {
		console.log(`Project page mounted with projectId: ${projectId}, running all queries...`);
		session.projects.get(projectId).then((p) => {
			if (p) {
				manager = new ProjectManager(p);
				manager.runAllCells();
			}
		});
	});

	onDestroy(() => {
		console.log('Project page destroyed, aborting all cells...');
		if (manager) {
			manager.abortAllCells();
			manager = null;
		}
	});
	setContext(PROJECT_MANAGER, () => manager);

	const exportQuery = $derived.by(() => {
		if (manager && manager.exportCandidateId) {
			const cell = manager.getCell(manager.exportCandidateId);
			if (cell && cell.type === 'query') {
				return (cell as QueryCellType).content.query;
			}
		}
		return null;
	});
</script>

<svelte:head>
	{#if manager && manager.project}
		<title>{manager.project.name}</title>
	{:else}
		<title>Project not found</title>
	{/if}
</svelte:head>

{#if manager && manager.project}
	<div class="flex h-full flex-col gap-8 p-4">
		{#if !auth.isGuest}
			<div class="flex justify-between">
				<Button href={withBase('/mobile-observations/projects')}>
					<ArrowLeft />
					Back
				</Button>
			</div>
		{/if}
		<ProjectHeader />
		<div class="flex h-full flex-col gap-2">
			{#each manager.project.cells as cell, index (cell.id)}
				<div class="group flex h-full flex-col gap-2" animate:flip={{ duration: 300 }}>
					<div
						class="flex w-full items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
					>
						<CellCreateMenu {index} />
					</div>
					<Cell bind:cell={manager.project.cells[index]} />
				</div>
			{/each}
			{#if manager.project.cells.length === 0}
				<p>
					You have not added any observations to this project yet. Click the "+ Query" button below
					to construct a new query.
				</p>
			{/if}
			<div
				class={twMerge('flex w-full items-center justify-center opacity-100 transition-opacity')}
			>
				<CellCreateMenu index={manager.project.cells.length} />
			</div>
		</div>
	</div>
{/if}

{#if exportQuery}
	<CreateExportDialog
		open
		query={exportQuery}
		isQueryEditable={false}
		onOpenChange={(isOpen) => {
			if (!isOpen && manager) {
				manager.exportCandidateId = null;
			}
		}}
		onSuccess={() => {
			window.open(withBase('/exports'), '_blank');
		}}
	/>
{/if}
