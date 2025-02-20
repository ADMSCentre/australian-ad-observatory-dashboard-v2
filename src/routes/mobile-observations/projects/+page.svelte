<script lang="ts">
	import { page } from '$app/stores';
	import { PROJECTS } from './mock';
	import ProjectSummaryCard from './components/project-summary-card.svelte';
	import ProjectPage from './components/project-page.svelte';
	import type { Project } from './types';

	const projectId = $derived($page.url.searchParams.get('project_id'));
	// const project = $derived(PROJECTS.find((p) => p.id === projectId));

	let project = $state<Project | null>(null);
	$effect(() => {
		project = PROJECTS.find((p) => p.id === projectId) ?? null;
	});
</script>

{#if projectId && project}
	<ProjectPage bind:project />
{:else}
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each PROJECTS as project}
			<ProjectSummaryCard {project} />
		{/each}
	</div>
{/if}
