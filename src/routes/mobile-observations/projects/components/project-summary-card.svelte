<script lang="ts">
	import type { Project } from '../types';
	import { goto } from '$app/navigation';
	import { withBase } from '$lib/utils';

	const { project }: { project: Project } = $props();

	function navigateToProject() {
		goto(withBase(`/mobile-observations/projects?project_id=${project.id}`));
	}
</script>

<button
	class="cursor-pointer rounded-lg bg-card p-4 text-left text-card-foreground shadow-md hover:shadow-2xl"
	onclick={navigateToProject}
>
	<h2 class="text-xl font-bold">{project.name}</h2>
	<p class="mt-2 text-sm">{project.description}</p>
	<p class="mt-4 text-sm">Team Members: {project.team.length}</p>
</button>

<style>
	.bg-card {
		background-color: var(--card);
	}
	.text-card-foreground {
		color: var(--card-foreground);
	}
</style>
