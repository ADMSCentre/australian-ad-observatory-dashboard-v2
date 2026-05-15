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
	class="flex h-52 w-full cursor-pointer flex-col justify-between rounded-xl border border-border bg-card p-4 text-left text-card-foreground shadow-none transition-all duration-200 hover:bg-muted/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
	onclick={navigateToProject}
>
	<div class="flex flex-row items-start justify-between gap-4">
		<h2 class="line-clamp-2 text-lg font-semibold leading-6 tracking-normal">{project.name}</h2>
		<!-- <Button size="icon" variant="destructive">
			<Trash />
		</Button> -->
		{#if manager?.currentUser.isAdmin}
			<Dialog.Root open={isDeleteDialogOpen} onOpenChange={(open) => (isDeleteDialogOpen = open)}>
				<Dialog.Trigger>
					<Button
						size="icon"
						variant="ghost"
						class="size-8 shrink-0 text-destructive/40 hover:bg-destructive/10 hover:text-destructive"
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
						<Dialog.Title>Delete project?</Dialog.Title>
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
	<div class="mt-3 h-full max-h-20 overflow-hidden text-sm leading-5 text-muted-foreground">
		{@html project.description || '<p>No description provided.</p>'}
	</div>
	<div class="mt-4 flex items-center justify-between gap-4 pt-3">
		<p class="truncate text-xs text-muted-foreground">
			<span class="font-medium text-foreground">Owner:</span>
			{project.ownerId}
		</p>
		<p class="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
			{project.team.length} member{project.team.length === 1 ? '' : 's'}
		</p>
	</div>
</button>
