<script lang="ts">
	import { session } from '$lib/api/session/session.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import Dropdown from '$lib/components/dropdown/dropdown.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Plus, Users, X, CrownIcon, UserIcon } from 'lucide-svelte';
	import { PROJECT_MANAGER, ProjectManager } from 'mobile-observations/projects/manager.svelte';
	import type { TeamMember } from 'mobile-observations/projects/types';
	import { getContext } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import * as HoverCard from '$lib/components/ui/hover-card';
	import UserSearch from '$lib/components/user-search/user-search.svelte';

	const { class: className = '' }: { class?: string } = $props();

	const projectManagerContext = (getContext(PROJECT_MANAGER) as () => ProjectManager | undefined)();
	if (!projectManagerContext)
		throw new Error(
			'Project Manager not found. This component must be rendered inside a ProjectPage component.'
		);
	const projectManager = projectManagerContext;
	const project = projectManager.project;

	type Role = TeamMember['role'];

	const roleLabels: Record<Role, string> = {
		admin: 'Admins',
		editor: 'Editors',
		viewer: 'Viewers'
	};

	const roleDescriptions: Record<Role, string> = {
		admin: 'Can manage the project, team access, query cells, and exports.',
		editor: 'Can edit project content, run queries, and configure visualisations.',
		viewer: 'Can view project content and query outputs.'
	};

	const roles: Role[] = ['admin', 'editor', 'viewer'];

	let newMember = $state<TeamMember>({
		username: '',
		role: 'viewer'
	});

	let manageTeamOpen = $state(false);
	let draggedUsername = $state<string | null>(null);
	let dragTargetRole = $state<Role | null>(null);
	let deleteMemberUsername = $state<string | null>(null);
	let deleteMemberDialogOpen = $state(false);

	const groupedMembers = $derived.by(() => {
		const groups: Record<Role, TeamMember[]> = {
			admin: [],
			editor: [],
			viewer: []
		};
		for (const member of project?.team ?? []) {
			groups[member.role].push(member);
		}
		return groups;
	});

	const deleteMemberName = $derived(
		deleteMemberUsername ? getMemberName(deleteMemberUsername) : 'this user'
	);

	function addMember() {
		if (!project || !newMember.username) return;
		project.team.push(newMember);
		projectManager.update();
		newMember = {
			username: '',
			role: 'viewer'
		};
	}

	function getMemberName(username: string) {
		const user = session.users.all.find((item) => item.username === username);
		return user?.fullname || username;
	}

	function getMemberUser(username: string) {
		return session.users.all.find((item) => item.username === username);
	}

	function requestDeleteMember(username: string) {
		deleteMemberUsername = username;
		deleteMemberDialogOpen = true;
	}

	function confirmDeleteMember() {
		if (!project || !deleteMemberUsername) return;
		project.team = project.team.filter((member) => member.username !== deleteMemberUsername);
		projectManager.update();
		deleteMemberUsername = null;
		deleteMemberDialogOpen = false;
	}

	function updateMemberRole(username: string, role: Role) {
		if (!projectManager.currentUser.isAdmin || !project) return;
		const member = project.team.find((item) => item.username === username);
		if (!member || member.username === project.ownerId || member.role === role) return;
		member.role = role;
		projectManager.update();
	}

	function handleMemberDragStart(event: DragEvent, username: string) {
		if (!projectManager.currentUser.isAdmin || username === project?.ownerId) return;
		draggedUsername = username;
		event.dataTransfer?.setData('text/plain', username);
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
		}
	}

	function handleRoleDrop(event: DragEvent, role: Role) {
		event.preventDefault();
		const username = event.dataTransfer?.getData('text/plain') || draggedUsername;
		if (username) updateMemberRole(username, role);
		draggedUsername = null;
		dragTargetRole = null;
	}

	const availableUsers = $derived.by(() => {
		if (!project) return [];
		return session.users.all.filter((user) => {
			return !project.team.some((member) => member.username === user.username);
		});
	});
</script>

{#if project}
	<aside class={twMerge('flex flex-col gap-4 p-1', className)}>
		<Button variant="outline" size="sm" class="h-8" onclick={() => (manageTeamOpen = true)}>
			<Users class="size-4" />
			Manage Team
		</Button>
	</aside>

	<Dialog.Root bind:open={manageTeamOpen}>
		<Dialog.Content class="sm:max-w-xl">
			<Dialog.Header>
				<Dialog.Title>Manage Team</Dialog.Title>
				<Dialog.Description>Drag users between groups to change their role.</Dialog.Description>
			</Dialog.Header>
			<div class="flex flex-col gap-4">
				<div class="flex flex-col gap-4">
					{#each roles as role (role)}
						<section
							role="group"
							aria-label={roleLabels[role]}
							class={twMerge(
								'flex min-h-24 flex-col gap-3 rounded-lg border border-border bg-muted/20 p-3 transition-colors',
								dragTargetRole === role && 'border-foreground bg-muted/40'
							)}
							ondragover={(event) => {
								if (!projectManager.currentUser.isAdmin) return;
								event.preventDefault();
								dragTargetRole = role;
							}}
							ondragleave={() => {
								if (dragTargetRole === role) dragTargetRole = null;
							}}
							ondrop={(event) => handleRoleDrop(event, role)}
						>
							<div class="space-y-1">
								<h3 class="text-sm font-semibold">{roleLabels[role]}</h3>
								<p class="text-xs leading-5 text-muted-foreground">{roleDescriptions[role]}</p>
							</div>

							<div class="flex flex-wrap gap-2">
								{#each groupedMembers[role] as member (member.username)}
									{@const memberUser = getMemberUser(member.username)}
									{@const isOwner = member.username === project.ownerId}
									<HoverCard.Root openDelay={200}>
										<HoverCard.Trigger>
											<Badge
												variant="secondary"
												class={twMerge(
													'gap-1 rounded-md border border-border bg-background py-1 pr-1 text-foreground cursor-default',
													projectManager.currentUser.isAdmin &&
														!isOwner &&
														'cursor-grab active:cursor-grabbing'
												)}
												draggable={projectManager.currentUser.isAdmin && !isOwner}
												ondragstart={(event: DragEvent) =>
													handleMemberDragStart(event, member.username)}
												ondragend={() => {
													draggedUsername = null;
													dragTargetRole = null;
												}}
											>
												{#if isOwner}
													<CrownIcon class="size-3 shrink-0 text-amber-600" />
												{:else}
													<UserIcon class="size-3 shrink-0 text-muted-foreground" />
												{/if}
												<span class="max-w-40 truncate">{getMemberName(member.username)}</span>
												{#if !isOwner && projectManager.currentUser.isAdmin}
													<button
														type="button"
														class="flex size-4 items-center justify-center rounded hover:bg-destructive/10 hover:text-destructive"
														aria-label={`Remove ${getMemberName(member.username)}`}
														onclick={() => requestDeleteMember(member.username)}
													>
														<X class="size-3" />
													</button>
												{/if}
											</Badge>
										</HoverCard.Trigger>
										<HoverCard.Content class="flex w-fit flex-col gap-1 rounded-xl">
											<p class="text-sm font-semibold">{memberUser?.fullname || member.username}</p>
											<p class="text-xs text-muted-foreground">{memberUser?.username || member.username}</p>
										</HoverCard.Content>
									</HoverCard.Root>
								{/each}
							</div>
						</section>
					{/each}
				</div>

				{#if projectManager.currentUser.isAdmin}
					<div
						class="grid grid-cols-[minmax(0,1fr)_7.5rem_auto] items-center gap-x-2 gap-y-2 border-t border-border pt-4"
					>
						<UserSearch
							users={availableUsers}
							bind:selected={newMember.username}
							placeholder="New member"
							triggerClass="w-full h-8 px-2 text-xs"
							contentClass="w-72"
						/>
						<Dropdown
							bind:selected={newMember.role}
							triggerClass="w-full h-8 px-2 text-xs"
							contentClass="w-32"
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
						/>
						<Button size="icon" class="size-8" disabled={!newMember.username} onclick={addMember}>
							<Plus class="size-4" />
						</Button>
					</div>
				{/if}
			</div>
		</Dialog.Content>
	</Dialog.Root>

	<Dialog.Root
		open={deleteMemberDialogOpen}
		onOpenChange={(open) => {
			deleteMemberDialogOpen = open;
			if (!open) deleteMemberUsername = null;
		}}
	>
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>Remove team member?</Dialog.Title>
				<Dialog.Description>
					This will remove {deleteMemberName} from the project team.
				</Dialog.Description>
			</Dialog.Header>
			<Dialog.Footer>
				<Button
					variant="outline"
					onclick={() => {
						deleteMemberDialogOpen = false;
						deleteMemberUsername = null;
					}}
				>
					Cancel
				</Button>
				<Button variant="destructive" onclick={confirmDeleteMember}>Remove</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{/if}
