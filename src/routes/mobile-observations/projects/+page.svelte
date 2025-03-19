<script lang="ts">
	import { page } from '$app/stores';
	import ProjectSummaryCard from './components/project-summary-card.svelte';
	import ProjectPage from './components/project-page.svelte';
	import type { Project } from './types';
	import { session } from '$lib/api/session/session.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Plus } from 'lucide-svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input';
	import { flip } from 'svelte/animate';
	import Tiptap from '$lib/components/tiptap.svelte';
	import { scale } from 'svelte/transition';

	const projectId = $derived($page.url.searchParams.get('project_id'));
	// const project = $derived(PROJECTS.find((p) => p.id === projectId));

	// let project = $state<Project | null>(null);
	// $effect(() => {
	// 	if (projectId) {
	// 		session.projects.get(projectId).then((p) => {
	// 			project = p ?? null;
	// 		});
	// 	}
	// });

	let isCreateDialogOpen = $state(false);
	let newProject = $state({
		name: '',
		description: ''
	});
</script>

{#if projectId}
	<ProjectPage {projectId} />
	<!-- {#await projectPromise then project}
		{#if project}
		{/if}
	{/await} -->
{:else}
	<div class="flex flex-col gap-4">
		<h1 class="text-4xl font-bold">Projects</h1>
		<p class="text-lg">Select a project to view its observations.</p>
		<div class="flex items-center justify-between">
			<h2 class="text-xl font-semibold">My Projects</h2>
			<Dialog.Root open={isCreateDialogOpen} onOpenChange={(open) => (isCreateDialogOpen = open)}>
				<Dialog.Trigger>
					<Button>
						<Plus />New Project
					</Button>
				</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title>Create new project</Dialog.Title>
						<Dialog.Description>Enter the details of the new project.</Dialog.Description>
						<div class="flex flex-col gap-4">
							<div class="flex flex-col gap-2">
								<span class="text-sm font-semibold">Project Name</span>
								<Input bind:value={newProject.name} placeholder="Project Name" required />
							</div>
							<div class="flex flex-col gap-2">
								<span class="text-sm font-semibold">Project Description</span>
								<!-- <Input bind:value={newProject.name} placeholder="Project Name" required /> -->
								<Tiptap
									class="min-h-24 w-full rounded-lg border border-gray-300 p-2"
									bind:value={newProject.description}
									placeholder="Enter a description for the project..."
								></Tiptap>
							</div>
							<div class="flex justify-end">
								<Button
									disabled={!newProject.name}
									onclick={async () => {
										await session.projects.create({
											name: newProject.name,
											description: newProject.description
										});
										isCreateDialogOpen = false;
									}}
								>
									Create
								</Button>
							</div>
						</div>
					</Dialog.Header>
				</Dialog.Content>
			</Dialog.Root>
		</div>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{#each session.projects.owned as project (project.id)}
				<div animate:flip transition:scale>
					<ProjectSummaryCard {project} />
				</div>
			{/each}
		</div>
		<h2 class="text-xl font-semibold">Shared Projects</h2>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each session.projects.shared as project (project.id)}
				<div animate:flip transition:scale>
					<ProjectSummaryCard {project} />
				</div>
			{/each}
		</div>
	</div>
{/if}
