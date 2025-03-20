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
	import { getContext, onMount, setContext } from 'svelte';
	import { PROJECT_MANAGER, ProjectManager } from '../manager.svelte';
	import { flip } from 'svelte/animate';
	import CellCreateMenu from './cells/cell-create-menu.svelte';
	import { auth } from '$lib/api/auth/auth.svelte';
	import { withBase } from '$lib/utils';
	import { ArrowLeft } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { twMerge } from 'tailwind-merge';
	import { session } from '$lib/api/session/session.svelte';

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
	setContext(PROJECT_MANAGER, () => manager);
</script>

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
					<div class="relative size-full flex-1">
						{#if cell.type === 'text'}
							<TextCell bind:content={cell.content} />
						{:else if cell.type === 'query'}
							<QueryCell bind:cell={manager.project.cells[index] as QueryCellType} />
						{/if}
						<CellControls {cell} class=" absolute right-4 top-0 -translate-y-1/2 " />
					</div>
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
