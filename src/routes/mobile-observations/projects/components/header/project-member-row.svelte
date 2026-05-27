<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { TeamMember } from 'mobile-observations/projects/types';
	import { CrownIcon, TrashIcon, UserIcon, X } from 'lucide-svelte';
	import { PROJECT_MANAGER, ProjectManager } from 'mobile-observations/projects/manager.svelte';
	import { getContext } from 'svelte';
	import Dropdown from '$lib/components/dropdown/dropdown.svelte';
	import { session } from '$lib/api/session/session.svelte';
	import * as HoverCard from '$lib/components/ui/hover-card';

	const { member }: { member: TeamMember } = $props();

	const projectManager = (getContext(PROJECT_MANAGER) as () => ProjectManager | undefined)();
	if (!projectManager)
		throw new Error(
			'Project Manager not found. This component must be rendered inside a ProjectPage component.'
		);
	const project = projectManager.project;

	const isOwner = $derived(project?.ownerId === member.username);
	let isDeleting = $state(false);

	const linkedUser = $derived(session.users.all.find((user) => user.username === member.username));
</script>

{#snippet deleteConfirm()}
	<Button
		variant="ghost"
		size="icon"
		onclick={() => {
			// Cancel deletion
			isDeleting = false;
		}}
		class="size-7"
		aria-label="Cancel removal"
	>
		<X class="size-4" />
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
		class="size-7"
		aria-label="Confirm removal"
	>
		<TrashIcon class="size-4" />
	</Button>
{/snippet}

{#if project}
	<div class="contents">
		<span class="inline-flex min-w-0 items-center gap-2 text-sm">
			{#if isOwner}
				<CrownIcon class="size-4 shrink-0 text-brand" />
			{:else}
				<UserIcon class="size-4 shrink-0 text-muted-foreground" />
			{/if}
			<HoverCard.Root openDelay={200}>
				<HoverCard.Trigger class="inline-block min-w-0 truncate no-underline">
					{linkedUser?.fullname || member.username}
				</HoverCard.Trigger>
				<HoverCard.Content class="flex w-fit flex-col gap-1 rounded-xl">
					<p class="text-sm font-semibold">{linkedUser?.fullname}</p>
					<p class="text-xs text-muted-foreground">{linkedUser?.username}</p>
				</HoverCard.Content>
			</HoverCard.Root>
		</span>
		<Dropdown
			selected={member.role}
			triggerClass="w-full h-8 px-2 text-xs"
			contentClass="w-32"
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
		<div class="flex items-center justify-end">
			{#if member.username !== project.ownerId && projectManager.currentUser.isAdmin}
				{#if !isDeleting}
					<Button
						variant="destructive"
						size="icon"
						onclick={() => {
							isDeleting = true;
						}}
						class="size-7"
						aria-label="Remove member"
					>
						<TrashIcon class="size-4" />
					</Button>
					<Button size="icon" class="invisible size-7" disabled>
						<TrashIcon class="size-4" />
					</Button>
				{:else}
					{@render deleteConfirm()}
				{/if}
			{/if}
		</div>
	</div>
{/if}
