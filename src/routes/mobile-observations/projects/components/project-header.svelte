<script lang="ts">
	import { session } from '$lib/api/session/session.svelte';
	import Tiptap from '$lib/components/tiptap.svelte';
	import type { Project } from '../types';
	import ProjectMembers from './header/project-members.svelte';

	let { project = $bindable() }: { project: Project } = $props();
</script>

<div class="flex flex-col gap-4 sm:flex-row sm:justify-between sm:gap-20">
	<div class="flex w-full flex-1 flex-col gap-4">
		<h1 class="text-4xl font-bold">{project.name}</h1>
		<Tiptap
			class="rounded border p-4 "
			bind:value={project.description}
			oninput={(description) => {
				console.log(description);
				session.projects.updateProject({
					...project,
					description
				});
			}}
		></Tiptap>
	</div>

	<ProjectMembers bind:project />
</div>
