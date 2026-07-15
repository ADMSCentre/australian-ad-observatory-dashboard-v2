<script lang="ts">
	import { session } from '$lib/api/session/session.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Plus, Search, Users, X, CrownIcon, UserIcon } from 'lucide-svelte';
	import { PROJECT_MANAGER, ProjectManager } from 'mobile-observations/projects/manager.svelte';
	import type { TeamMember } from 'mobile-observations/projects/types';
	import { getContext } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import * as HoverCard from '$lib/components/ui/hover-card';

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

	const roleOptionLabels: Record<Role, string> = {
		admin: 'Admin',
		editor: 'Editor',
		viewer: 'Viewer'
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
	let memberSearchQuery = $state('');
	let memberSearchOpen = $state(false);
	let activeMemberSearchIndex = $state(0);
	let memberSearchInput = $state<HTMLInputElement | null>(null);

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

	function getUserSearchLabel(username: string) {
		const user = session.users.all.find((item) => item.username === username);
		if (!user) return username;
		return `${user.fullname || user.username} (${user.username})`;
	}

	function selectMember(username: string) {
		newMember.username = username;
		memberSearchQuery = getUserSearchLabel(username);
		memberSearchOpen = false;
		activeMemberSearchIndex = 0;
		memberSearchInput?.focus();
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

	const filteredAvailableUsers = $derived.by(() => {
		const query = memberSearchQuery.trim().toLowerCase();
		if (!query) return availableUsers.slice(0, 8);
		return availableUsers
			.filter((user) => {
				return [user.fullname, user.username, user.id].some((value) =>
					value?.toLowerCase().includes(query)
				);
			})
			.slice(0, 8);
	});

	function handleMemberSearchKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			memberSearchOpen = true;
			activeMemberSearchIndex = Math.min(
				activeMemberSearchIndex + 1,
				Math.max(filteredAvailableUsers.length - 1, 0)
			);
		}
		if (event.key === 'ArrowUp') {
			event.preventDefault();
			activeMemberSearchIndex = Math.max(activeMemberSearchIndex - 1, 0);
		}
		if (event.key === 'Enter') {
			event.preventDefault();
			const user = filteredAvailableUsers[activeMemberSearchIndex];
			if (user) selectMember(user.username);
		}
		if (event.key === 'Escape') {
			memberSearchOpen = false;
		}
	}
</script>

{#if project}
	<aside class={twMerge('flex flex-col gap-4 p-1', className)}>
		<Button variant="outline" size="sm" class="h-8" onclick={() => (manageTeamOpen = true)}>
			<Users class="size-4" />
			Manage Team
		</Button>
	</aside>

	<Dialog.Root bind:open={manageTeamOpen}>
		<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-6xl">
			<Dialog.Header>
				<Dialog.Title>Manage Team</Dialog.Title>
			</Dialog.Header>
			<div class="flex flex-col gap-4">
				{#if projectManager.currentUser.isAdmin}
					<div class="border-b border-border pb-4">
						<div class="mb-3 space-y-1">
							<h3 class="text-sm font-semibold text-foreground">Add Collaborator</h3>
							<p class="text-xs leading-5 text-muted-foreground">
								Use the form below to add a new collaborator to this project.
							</p>
						</div>
						<div class="flex flex-col gap-2 sm:flex-row">
							<div class="relative flex-1">
								<Search
									class="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground"
								/>
								<input
									bind:this={memberSearchInput}
									bind:value={memberSearchQuery}
									type="text"
									placeholder="Search for a user to add to project..."
									autocomplete="off"
									role="combobox"
									aria-expanded={memberSearchOpen}
									aria-controls="project-member-search-listbox"
									aria-activedescendant={memberSearchOpen
										? `project-member-search-option-${activeMemberSearchIndex}`
										: undefined}
									class="h-9 w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
									oninput={() => {
										newMember.username = '';
										memberSearchOpen = true;
										activeMemberSearchIndex = 0;
									}}
									onclick={() => {
										memberSearchOpen = true;
									}}
									onblur={() => {
										setTimeout(() => {
											memberSearchOpen = false;
										}, 100);
									}}
									onkeydown={handleMemberSearchKeydown}
								/>
								{#if memberSearchOpen}
									<ul
										id="project-member-search-listbox"
										role="listbox"
										class="absolute left-0 top-full z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-border bg-card shadow-md"
									>
										{#each filteredAvailableUsers as user, index (user.username)}
											<li
												id={`project-member-search-option-${index}`}
												role="option"
												aria-selected={index === activeMemberSearchIndex}
												class={twMerge(
													'flex cursor-pointer flex-col px-3 py-2 text-sm transition-colors',
													index === activeMemberSearchIndex
														? 'bg-accent text-accent-foreground'
														: 'text-foreground hover:bg-muted'
												)}
												onmousedown={(event) => {
													event.preventDefault();
													selectMember(user.username);
												}}
												onmouseenter={() => {
													activeMemberSearchIndex = index;
												}}
											>
												<span class="font-medium">{user.fullname || user.username}</span>
												<span class="text-xs text-muted-foreground">{user.username}</span>
											</li>
										{/each}
										{#if filteredAvailableUsers.length === 0}
											<li class="px-3 py-2 text-sm text-muted-foreground">No users found.</li>
										{/if}
									</ul>
								{/if}
							</div>
							<select
								bind:value={newMember.role}
								class="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:w-32"
							>
								{#each roles as role (role)}
									<option value={role}>{roleOptionLabels[role]}</option>
								{/each}
							</select>
							<Button
								class="h-9 gap-2"
								disabled={!newMember.username}
								onclick={() => {
									addMember();
									memberSearchQuery = '';
									memberSearchOpen = false;
									activeMemberSearchIndex = 0;
								}}
							>
								<Plus class="size-4" />
								Add
							</Button>
						</div>
					</div>
				{/if}

				<div class="flex flex-col gap-4">
					<div class="space-y-1">
						<h3 class="text-sm font-semibold text-foreground">Current Users</h3>
						<p class="text-xs leading-5 text-muted-foreground">
							Drag users between groups to change their role.
						</p>
					</div>
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
													'cursor-default gap-1 rounded-md border border-border bg-background py-1 pr-1 text-foreground',
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
													<CrownIcon class="size-3 shrink-0 text-brand" />
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
											<p class="text-xs text-muted-foreground">
												{memberUser?.username || member.username}
											</p>
										</HoverCard.Content>
									</HoverCard.Root>
								{/each}
							</div>
						</section>
					{/each}
				</div>
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
