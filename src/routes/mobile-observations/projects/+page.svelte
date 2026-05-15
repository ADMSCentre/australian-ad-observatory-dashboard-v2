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
	let loading = $state(false);

	$effect(() => {
		auth.currentUser;
		untrack(async () => {
			loading = true;
			await session.projects.fetch();
			loading = false;
		});
	});

	let isCreateDialogOpen = $state(false);
	let newProject = $state({
		name: '',
		description: ''
	});
</script>

<svelte:head>
	<title>Projects</title>
</svelte:head>

{#if loading}
	<PageLoader />
{/if}

{#if projectId}
	<ProjectPage {projectId} />
{/if}

{#if !projectId && !loading}
	<div class="flex w-full flex-col gap-6 px-2 py-6 sm:px-4">
		<div class="space-y-1">
			<h1 class="text-2xl font-semibold tracking-normal text-foreground">Projects</h1>
			<p class="text-sm leading-6 text-muted-foreground">
				Select a project to view, annotate, and export observations.
			</p>
		</div>

		<section class="space-y-4">
			<div
				class="flex flex-col gap-3 rounded-xl bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between"
			>
				<div class="space-y-1">
					<h2 class="text-lg font-semibold tracking-normal">
						My Projects ({session.projects.owned.length})
					</h2>
					<p class="text-sm leading-5 text-muted-foreground">
						These are the projects you own. You can create new projects or edit existing ones.
					</p>
				</div>
				<Dialog.Root open={isCreateDialogOpen} onOpenChange={(open) => (isCreateDialogOpen = open)}>
					<Dialog.Trigger>
						<Button class="h-9 gap-2">
							<Plus class="size-4" />New Project
						</Button>
					</Dialog.Trigger>
					<Dialog.Content class="rounded-xl">
						<Dialog.Header>
							<Dialog.Title>Create new project</Dialog.Title>
							<Dialog.Description>Enter the details of the new project.</Dialog.Description>
							<div class="flex flex-col gap-4 pt-2">
								<label class="flex flex-col gap-2">
									<span class="text-sm font-medium">Project name</span>
									<Input bind:value={newProject.name} placeholder="Project name" required />
								</label>
								<label class="flex flex-col gap-2">
									<span class="text-sm font-medium">Project description</span>
									<Tiptap
										class="min-h-32 w-full"
										bind:value={newProject.description}
										placeholder="Enter a description for the project..."
									></Tiptap>
								</label>
								<div class="flex justify-end gap-2 pt-2">
									<Button
										variant="outline"
										onclick={() => {
											isCreateDialogOpen = false;
										}}>Cancel</Button
									>
									<Button
										disabled={!newProject.name}
										onclick={async () => {
											await session.projects.create({
												name: newProject.name,
												description: newProject.description
											});
											newProject = {
												name: '',
												description: ''
											};
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

			<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{#each session.projects.owned as project (project.id)}
					<div animate:flip={{ duration: 150 }} transition:scale>
						<ProjectSummaryCard {project} />
					</div>
				{/each}
			</div>
		</section>

		<section class="space-y-4">
			<div class="space-y-1">
				<h2 class="text-lg font-semibold tracking-normal">
					Shared Projects ({session.projects.shared.length})
				</h2>
				<p class="text-sm leading-5 text-muted-foreground">
					These projects are shared with you by others.
				</p>
			</div>
			<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{#each session.projects.shared as project (project.id)}
					<div animate:flip={{ duration: 150 }} transition:scale>
						<ProjectSummaryCard {project} />
					</div>
				{/each}
			</div>
		</section>

		{#if auth.currentUser?.role === 'admin'}
			<section class="space-y-4">
				<div class="space-y-1">
					<h2 class="text-lg font-semibold tracking-normal">
						Other Projects ({session.projects.other.length})
					</h2>
					<p class="text-sm leading-5 text-muted-foreground">
						These projects are not owned or shared with you, but you can view them as an
						administrator.
					</p>
				</div>
				<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
					{#each session.projects.other as project (project.id)}
						<div animate:flip={{ duration: 150 }} transition:scale>
							<ProjectSummaryCard {project} />
						</div>
					{/each}
				</div>
			</section>
		{/if}
	</div>
{/if}
