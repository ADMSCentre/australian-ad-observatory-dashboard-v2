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
	import { untrack } from 'svelte';
	import { auth } from '$lib/api/auth/auth.svelte';
	import PageLoader from '$lib/components/page-loader/page-loader.svelte';

	const projectId = $derived($page.url.searchParams.get('project_id'));
	let project = $state<Project | null>(null);

	let loading = $state(false);

	$effect(() => {
		auth.currentUser;
		projectId;
		untrack(async () => {
			loading = true;
			await session.projects.fetch();
			loading = false;
			if (projectId) {
				loading = true;
				project = (await session.projects.get(projectId)) ?? null;
				loading = false;
			}
		});
	});

	let isCreateDialogOpen = $state(false);
	let newProject = $state({
		name: '',
		description: ''
	});

	$inspect({ project });
</script>

<svelte:head>
	{#if projectId}
		{#if project}
			<title>{project?.name}</title>
		{:else}
			<title>Project not found</title>
		{/if}
	{:else}
		<title>Projects</title>
	{/if}
</svelte:head>

{#if loading}
	<PageLoader />
{/if}

{#if projectId}
	{#if !loading}
		<ProjectPage {projectId} />
	{/if}
{:else if !loading}
	<div class="flex flex-col gap-4">
		<h1 class="text-4xl font-bold">Projects</h1>
		<p class="text-lg">Select a project to view its observations.</p>
		<div class="flex items-center justify-between">
			<div class="flex flex-col gap-1">
				<h2 class="text-xl font-semibold">My Projects ({session.projects.owned.length})</h2>
				<p class="text-sm text-gray-500">
					These are the projects you own. You can create new projects or edit existing ones.
				</p>
			</div>
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

		<div class="flex flex-row flex-wrap gap-4">
			{#each session.projects.owned as project (project.id)}
				<div animate:flip transition:scale class="h-52 w-96">
					<ProjectSummaryCard {project} />
				</div>
			{/each}
		</div>
		<div class="flex flex-col gap-1">
			<h2 class="text-xl font-semibold">Shared Projects ({session.projects.shared.length})</h2>
			<p class="text-sm text-muted-foreground">These projects are shared with you by others.</p>
		</div>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each session.projects.shared as project (project.id)}
				<div animate:flip transition:scale>
					<ProjectSummaryCard {project} />
				</div>
			{/each}
		</div>
		{#if auth.currentUser?.role === 'admin'}
			<div class="flex flex-col gap-1">
				<h2 class="text-xl font-semibold">Other Projects ({session.projects.other.length})</h2>
				<p class="text-sm text-muted-foreground">
					These projects are not owned or shared with you, but you can view them as an
					administrator.
				</p>
			</div>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each session.projects.other as project (project.id)}
					<div animate:flip transition:scale>
						<ProjectSummaryCard {project} />
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/if}
