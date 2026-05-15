<script lang="ts">
	import { page } from '$app/stores';
	import ProjectSummaryCard from './components/project-summary-card.svelte';
	import ProjectPage from './components/project-page.svelte';
	import type { Project } from './types';
	import { session } from '$lib/api/session/session.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Plus, Search } from 'lucide-svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { flip } from 'svelte/animate';
	import Tiptap from '$lib/components/tiptap.svelte';
	import { scale } from 'svelte/transition';
	import { untrack } from 'svelte';
	import { auth } from '$lib/api/auth/auth.svelte';
	import PageLoader from '$lib/components/page-loader/page-loader.svelte';

	type ProjectTab = 'owned' | 'shared' | 'other';

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
	let activeTab = $state<ProjectTab>('owned');
	let didSelectFallbackTab = $state(false);
	let projectSearch = $state('');
	let debouncedProjectSearch = $state('');
	let projectSearchInput = $state<HTMLInputElement | null>(null);

	const isAdmin = $derived(auth.currentUser?.role === 'admin');

	const projectGroups = $derived.by(() => {
		return {
			owned: session.projects.owned,
			shared: session.projects.shared,
			other: isAdmin ? session.projects.other : []
		};
	});

	const visibleTabs = $derived.by(() => {
		const tabs: { value: ProjectTab; label: string; description: string }[] = [
			{
				value: 'owned',
				label: 'My Projects',
				description: 'Projects you own.'
			},
			{
				value: 'shared',
				label: 'Shared Projects',
				description: 'Projects shared with you.'
			}
		];
		if (isAdmin) {
			tabs.push({
				value: 'other',
				label: 'Other Projects',
				description: 'Projects visible through administrator access.'
			});
		}
		return tabs;
	});

	function stripHtml(value: string) {
		return value.replace(/<[^>]*>/g, ' ');
	}

	function ownerLabel(project: Project) {
		const owner = session.users.all.find((user) => user.username === project.ownerId);
		return [project.ownerId, owner?.fullname, owner?.username].filter(Boolean).join(' ');
	}

	function matchesProject(project: Project, query: string) {
		if (!query) return true;
		const haystack = [project.name, ownerLabel(project), stripHtml(project.description)]
			.join(' ')
			.toLowerCase();
		return haystack.includes(query);
	}

	const filteredProjectGroups = $derived.by(() => {
		const query = debouncedProjectSearch.trim().toLowerCase();
		return {
			owned: projectGroups.owned.filter((project) => matchesProject(project, query)),
			shared: projectGroups.shared.filter((project) => matchesProject(project, query)),
			other: projectGroups.other.filter((project) => matchesProject(project, query))
		};
	});

	$effect(() => {
		const value = projectSearch;
		const timeout = setTimeout(() => {
			debouncedProjectSearch = value;
		}, 250);
		return () => clearTimeout(timeout);
	});

	$effect(() => {
		if (!visibleTabs.some((tab) => tab.value === activeTab)) {
			activeTab = visibleTabs[0]?.value ?? 'owned';
			return;
		}
		const firstTab = visibleTabs[0];
		const secondTab = visibleTabs[1];
		if (firstTab && filteredProjectGroups[firstTab.value].length > 0) {
			didSelectFallbackTab = false;
		}
		if (
			!debouncedProjectSearch.trim() &&
			!didSelectFallbackTab &&
			activeTab === firstTab?.value &&
			secondTab &&
			filteredProjectGroups[firstTab.value].length === 0 &&
			filteredProjectGroups[secondTab.value].length > 0
		) {
			activeTab = secondTab.value;
			didSelectFallbackTab = true;
			return;
		}
		if (!debouncedProjectSearch.trim() || filteredProjectGroups[activeTab].length > 0) return;
		const nextTab = visibleTabs.find((tab) => filteredProjectGroups[tab.value].length > 0);
		if (nextTab) activeTab = nextTab.value;
	});

	function handleProjectSearchShortcut(event: KeyboardEvent) {
		if (projectId || !(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'f') return;
		event.preventDefault();
		projectSearchInput?.focus();
		projectSearchInput?.select();
	}
</script>

<svelte:head>
	<title>Projects</title>
</svelte:head>

<svelte:window onkeydown={handleProjectSearchShortcut} />

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

		<div
			class="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between"
		>
			<Tabs.Root bind:value={activeTab} class="min-w-0 flex-1">
				<Tabs.List class="h-auto flex-wrap justify-start rounded-md">
					{#each visibleTabs as tab (tab.value)}
						<Tabs.Trigger value={tab.value} class="gap-2">
							<span>{tab.label}</span>
							<span class="text-xs text-muted-foreground">
								{filteredProjectGroups[tab.value].length}
							</span>
						</Tabs.Trigger>
					{/each}
				</Tabs.List>
			</Tabs.Root>
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

		<div class="relative max-w-xl">
			<Search
				class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
			/>
			<Input
				bind:ref={projectSearchInput}
				bind:value={projectSearch}
				class="pl-9"
				placeholder="Search by title, owner, or description"
				aria-label="Search projects"
			/>
		</div>

		<Tabs.Root bind:value={activeTab}>
			{#each visibleTabs as tab (tab.value)}
				<Tabs.Content value={tab.value} class="mt-0 space-y-4">
					<div class="space-y-1">
						<h2 class="text-lg font-semibold tracking-normal">{tab.label}</h2>
						<p class="text-sm leading-5 text-muted-foreground">{tab.description}</p>
					</div>
					{#if filteredProjectGroups[tab.value].length > 0}
						<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
							{#each filteredProjectGroups[tab.value] as project (project.id)}
								<div animate:flip={{ duration: 150 }} transition:scale>
									<ProjectSummaryCard {project} />
								</div>
							{/each}
						</div>
					{:else}
						<div
							class="rounded-lg border border-border bg-muted/20 p-6 text-sm text-muted-foreground"
						>
							No projects found.
						</div>
					{/if}
				</Tabs.Content>
			{/each}
		</Tabs.Root>
	</div>
{/if}
