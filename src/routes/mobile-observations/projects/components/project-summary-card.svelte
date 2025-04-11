<script lang="ts">
	import type { Project } from '../types';
	import { goto } from '$app/navigation';
	import { withBase } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';
	import { Trash } from 'lucide-svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { session } from '$lib/api/session/session.svelte';
	import { onMount } from 'svelte';
	import { ProjectManager } from '../manager.svelte';
	const { project }: { project: Project } = $props();

	function navigateToProject() {
		goto(withBase(`/mobile-observations/projects?project_id=${project.id}`));
	}

	let manager = $state<ProjectManager | null>();
	onMount(() => {
		manager = new ProjectManager(project);
	});

	let isDeleteDialogOpen = $state(false);
</script>

<button
	class="flex size-full cursor-pointer flex-col justify-between rounded-lg border bg-card p-4 text-left text-card-foreground shadow-md hover:shadow-2xl"
	onclick={navigateToProject}
>
	<div class="flex flex-row items-center justify-between gap-4">
		<h2 class="text-xl font-bold">{project.name}</h2>
		<!-- <Button size="icon" variant="destructive">
			<Trash />
		</Button> -->
		{#if manager?.currentUser.isAdmin}
			<Dialog.Root open={isDeleteDialogOpen} onOpenChange={(open) => (isDeleteDialogOpen = open)}>
				<Dialog.Trigger>
					<Button
						size="icon"
						variant="destructive"
						onclick={(e) => {
							e.stopPropagation();
							isDeleteDialogOpen = true;
						}}
					>
						<Trash />
					</Button>
				</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
						<Dialog.Description
							>This action cannot be undone. This will delete the project and all of its queries.</Dialog.Description
						>
						<Dialog.Footer>
							<Button
								variant="destructive"
								onclick={async (e) => {
									await session.projects.deleteProject(project.id);
									isDeleteDialogOpen = false;
								}}>Delete</Button
							>
							<Button
								variant="ghost"
								onclick={(e) => {
									isDeleteDialogOpen = false;
								}}>Cancel</Button
							>
						</Dialog.Footer>
					</Dialog.Header>
				</Dialog.Content>
			</Dialog.Root>
		{/if}
	</div>
	<p class="mt-2 h-full max-h-20 overflow-hidden text-sm">{@html project.description}</p>
	<div class="flex items-center justify-between gap-4">
		<p class="mt-4 text-sm">Owner: {project.ownerId}</p>
		<p class="mt-4 text-sm">Members: {project.team.length}</p>
	</div>
</button>

<style>
	.bg-card {
		background-color: var(--card);
	}
	.text-card-foreground {
		color: var(--card-foreground);
	}
</style>
