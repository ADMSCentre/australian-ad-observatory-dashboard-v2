<script lang="ts">
	import { session } from '$lib/api/session/session.svelte';
	import Tiptap from '$lib/components/tiptap.svelte';
	import { getContext } from 'svelte';
	import { PROJECT_MANAGER, ProjectManager } from '../manager.svelte';
	import type { Project } from '../types';
	import ProjectMembers from './header/project-members.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { debounce } from '$lib/utils/debounce';

	const projectManager = (getContext(PROJECT_MANAGER) as () => ProjectManager | undefined)();
	if (!projectManager)
		throw new Error(
			'Project Manager not found. This component must be rendered inside a ProjectPage component.'
		);
</script>

{#if projectManager.project}
	<div class="flex flex-col gap-4 sm:flex-row sm:justify-between sm:gap-20">
		<div class="flex w-full flex-1 flex-col gap-4">
			<!-- <h1 class="text-4xl font-bold">{projectManager.project.name}</h1> -->
			<Input
				class="border-none p-0 text-4xl font-bold disabled:opacity-100"
				bind:value={projectManager.project.name}
				oninput={debounce(() => {
					projectManager.update();
				}, 500)}
				disabled={!projectManager.currentUser.isEditor}
			/>
			<Tiptap
				class="rounded border p-4 "
				bind:value={projectManager.project.description}
				oninput={() => {
					projectManager.update();
				}}
				inputDebounceAmount={5000}
				disabled={!projectManager.currentUser.isEditor}
			></Tiptap>
		</div>

		<ProjectMembers class="border-none shadow-none" />
	</div>
{/if}
