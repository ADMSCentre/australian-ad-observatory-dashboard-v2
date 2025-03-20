<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { auth } from '$lib/api/auth/auth.svelte';
	import type { TeamMember } from 'mobile-observations/projects/types';
	import { CrownIcon, TrashIcon, UserIcon, X } from 'lucide-svelte';
	import { PROJECT_MANAGER, ProjectManager } from 'mobile-observations/projects/manager.svelte';
	import { getContext } from 'svelte';
	import Dropdown from '$lib/components/dropdown/dropdown.svelte';

	const { member }: { member: TeamMember } = $props();

	const projectManager = (getContext(PROJECT_MANAGER) as () => ProjectManager | undefined)();
	if (!projectManager)
		throw new Error(
			'Project Manager not found. This component must be rendered inside a ProjectPage component.'
		);
	const project = projectManager.project;

	const isOwner = $derived(project?.ownerId === member.username);
	let isDeleting = $state(false);
</script>

{#snippet deleteConfirm()}
	<Button
		variant="ghost"
		size="icon"
		onclick={() => {
			// Cancel deletion
			isDeleting = false;
		}}
		class="size-6"
	>
		<X />
	</Button>
	<Button
		variant="destructive"
		size="icon"
		onclick={() => {
			isDeleting = false;
			if (!project || !projectManager) return;
			project.team = project.team.filter((m) => m.username !== member.username);
			projectManager.update();
		}}
		class="size-6"
	>
		<TrashIcon />
	</Button>
{/snippet}

{#if project}
	<div class="contents">
		<span class="flex items-center gap-2">
			{#if isOwner}
				<CrownIcon size={20} />
			{:else}
				<UserIcon size={20} />
			{/if}
			{member.username}</span
		>
		<Dropdown
			selected={member.role}
			triggerClass="w-full p-1 h-fit"
			disabled={!projectManager.currentUser.isAdmin}
			options={[
				{
					label: 'Viewer',
					value: 'viewer'
				},
				{
					label: 'Editor',
					value: 'editor'
				},
				{
					label: 'Admin',
					value: 'admin'
				}
			]}
			onSelected={(role) => {
				member.role = role;
				projectManager.update();
			}}
		/>
		<div>
			{#if auth.currentUser?.username !== member.username && member.username !== project.ownerId && projectManager.currentUser.isAdmin}
				{#if !isDeleting}
					<Button
						variant="destructive"
						size="icon"
						onclick={() => {
							isDeleting = true;
						}}
						class="size-6"
					>
						<TrashIcon />
					</Button>
					<Button size="icon" class="invisible size-6" disabled>
						<TrashIcon />
					</Button>
				{:else}
					{@render deleteConfirm()}
				{/if}
			{/if}
		</div>
	</div>
{/if}
