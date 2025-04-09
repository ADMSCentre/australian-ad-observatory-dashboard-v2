<script lang="ts">
	import { auth } from '$lib/api/auth/auth.svelte';
	import { session } from '$lib/api/session/session.svelte';
	import Dropdown from '$lib/components/dropdown/dropdown.svelte';
	import Tiptap from '$lib/components/tiptap.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Plus, UserPlusIcon, X } from 'lucide-svelte';
	import { PROJECT_MANAGER, ProjectManager } from 'mobile-observations/projects/manager.svelte';
	import type { Project, TeamMember } from 'mobile-observations/projects/types';
	import { getContext } from 'svelte';
	import ProjectMemberRow from './project-member-row.svelte';
	import { twMerge } from 'tailwind-merge';

	const { class: className = '' }: { class?: string } = $props();

	const projectManager = (getContext(PROJECT_MANAGER) as () => ProjectManager | undefined)();
	if (!projectManager)
		throw new Error(
			'Project Manager not found. This component must be rendered inside a ProjectPage component.'
		);
	const project = projectManager.project;

	let newMember = $state<TeamMember>({
		username: '',
		role: 'viewer'
	});
</script>

{#if project}
	<div class={twMerge('flex max-w-sm flex-col gap-4 border px-8 py-4 shadow-sm', className)}>
		<h2 class=" text-xl font-semibold">Team Members</h2>
		<div class="grid grid-cols-[2fr_1fr_auto] items-center gap-x-4 gap-y-2">
			{#each project.team as member}
				<ProjectMemberRow {member} />
			{/each}
			{#if projectManager.currentUser.isAdmin}
				<div class="contents">
					<span class="flex items-center gap-2">
						<UserPlusIcon size={20} />
						<!-- <Input
							type="text"
							class="h-fit p-1"
							bind:value={newMember.username}
							placeholder="Username"
						/> -->
						<Dropdown
							bind:selected={newMember.username}
							triggerClass="w-full p-1 h-fit"
							options={session.users.all
								.filter((user) => {
									return !project.team.some((member) => member.username === user.username);
								})
								.map((user) => ({
									label: user.username,
									value: user.username
								}))}
							placeholder="New member"
							searchable
						/>
					</span>
					<Dropdown
						bind:selected={newMember.role}
						triggerClass="w-full p-1 h-fit"
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
					<Button
						size="icon"
						class="size-6"
						onclick={() => {
							project.team.push(newMember);
							projectManager.update();
							newMember = {
								username: '',
								role: 'viewer'
							};
						}}
					>
						<Plus />
					</Button>
				</div>
			{/if}
		</div>
		<!-- New member -->
	</div>
{/if}
