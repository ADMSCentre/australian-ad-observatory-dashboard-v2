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
	import { setContext } from 'svelte';
	import { PROJECT_MANAGER, ProjectManager } from '../manager.svelte';
	import { flip } from 'svelte/animate';
	import CellCreateMenu from './cells/cell-create-menu.svelte';

	let { project = $bindable() }: { project: Project } = $props();

	setContext(PROJECT_MANAGER, new ProjectManager(project));
</script>

<div class="flex h-full flex-col gap-8 p-4">
	<ProjectHeader bind:project />
	<div class="flex h-full flex-col gap-2">
		<h2 class="text-xl font-semibold">Project Observations</h2>
		{#each project.cells as cell, index (cell.id)}
			<div class="group flex h-full flex-col gap-2" animate:flip={{ duration: 300 }}>
				<div
					class="flex w-full items-center justify-center opacity-0 transition-opacity hover:opacity-100"
				>
					<CellCreateMenu {index} />
				</div>
				<div class="relative size-full flex-1">
					{#if cell.type === 'text'}
						<TextCell content={cell.content} />
					{:else if cell.type === 'query'}
						<QueryCell bind:cell={project.cells[index] as QueryCellType} />
					{/if}
					<CellControls {cell} class=" absolute right-4 top-0 -translate-y-1/2 " />
				</div>
			</div>
		{/each}
		<div
			class="flex w-full items-center justify-center opacity-0 transition-opacity hover:opacity-100"
		>
			<CellCreateMenu index={project.cells.length} />
		</div>
	</div>
</div>
