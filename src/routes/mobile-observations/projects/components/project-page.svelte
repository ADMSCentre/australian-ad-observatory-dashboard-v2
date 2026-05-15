<script lang="ts">
	import { type QueryCell as QueryCellType } from '../types';
	import ProjectHeader from './project-header.svelte';
	import { onDestroy, onMount, setContext } from 'svelte';
	import { PROJECT_MANAGER, ProjectManager } from '../manager.svelte';
	import { flip } from 'svelte/animate';
	import CellCreateMenu from './cells/cell-create-menu.svelte';
	import { auth } from '$lib/api/auth/auth.svelte';
	import { withBase } from '$lib/utils';
	import { ArrowLeft } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { session } from '$lib/api/session/session.svelte';
	import Cell from './cells/cell.svelte';
	import CreateExportDialog from '../../../exports/components/create-export-dialog.svelte';

	const { projectId }: { projectId: string } = $props();

	let manager = $state<ProjectManager | null>();
	onMount(() => {
		session.projects.get(projectId).then((p) => {
			if (p) {
				manager = new ProjectManager(p);
				manager.runAllCells();
			}
		});
	});

	onDestroy(() => {
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
	<div class="flex h-full w-full flex-col gap-4 px-2 sm:px-4">
		{#if !auth.isGuest}
			<div class="flex justify-between border-b border-border pb-4">
				<Button
					variant="outline"
					class="h-9 gap-2"
					href={withBase('/mobile-observations/projects')}
				>
					<ArrowLeft class="size-4" />
					Back
				</Button>
			</div>
		{/if}
		<ProjectHeader />
		<div class="flex h-full flex-col gap-4">
			{#each manager.project.cells as cell, index (cell.id)}
				<div class="group flex h-full flex-col gap-2" animate:flip={{ duration: 240 }}>
					<div
						class="flex w-full items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100"
					>
						<CellCreateMenu {index} />
					</div>
					<Cell bind:cell={manager.project.cells[index]} />
				</div>
			{/each}
			{#if manager.project.cells.length === 0}
				<div class="rounded-xl border border-border bg-muted/30 p-6 text-center">
					<p class="text-sm leading-6 text-muted-foreground">
						You have not added any observations to this project yet. Add a text or query cell to
						start building the project.
					</p>
				</div>
			{/if}
			<div class="flex w-full items-center justify-center">
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
