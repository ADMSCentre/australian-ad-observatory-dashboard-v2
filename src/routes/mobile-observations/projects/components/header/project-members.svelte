<script lang="ts">
	import { session } from '$lib/api/session/session.svelte';
	import Dropdown from '$lib/components/dropdown/dropdown.svelte';
	import Tiptap from '$lib/components/tiptap.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Plus, X } from 'lucide-svelte';
	import type { Project, TeamMember } from 'mobile-observations/projects/types';

	let { project = $bindable() }: { project: Project } = $props();

	let newMember = $state<TeamMember>({
		username: '',
		role: 'viewer'
	});
</script>

<div class="flex max-w-sm flex-col gap-2 border px-8 py-4 shadow-sm">
	<h2 class=" text-xl font-semibold">Team Members</h2>
	<div class="flex flex-col gap-2">
		{#each project.team as member}
			<!-- <li>{member.username} - {member.role}</li> -->
			<div class="grid grid-cols-[5fr_2fr_1fr] items-center gap-2">
				<span>{member.username}</span>
				<span>{member.role}</span>
				<Button
					variant="destructive"
					size="icon"
					onclick={() => {
						project.team = project.team.filter((m) => m.username !== member.username);
					}}
					class="size-6"
				>
					<X />
				</Button>
			</div>
		{/each}
	</div>
	<!-- New member -->
	<div class="grid grid-cols-[5fr_2fr_1fr] items-center gap-2">
		<Input type="text" bind:value={newMember.username} placeholder="Username" />
		<Dropdown
			bind:selected={newMember.role}
			triggerClass="w-full"
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
			}}><Plus /></Button
		>
	</div>
</div>
