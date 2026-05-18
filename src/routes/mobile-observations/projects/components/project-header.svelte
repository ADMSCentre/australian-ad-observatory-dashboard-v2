<script lang="ts">
	import { session } from '$lib/api/session/session.svelte';
	import Tiptap from '$lib/components/tiptap.svelte';
	import { getContext } from 'svelte';
	import { PROJECT_MANAGER, ProjectManager } from '../manager.svelte';
	import ProjectMembers from './header/project-members.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { debounce } from '$lib/utils/debounce';
	import { CrownIcon } from 'lucide-svelte';

	const projectManager = (getContext(PROJECT_MANAGER) as () => ProjectManager | undefined)();
	if (!projectManager)
		throw new Error(
			'Project Manager not found. This component must be rendered inside a ProjectPage component.'
		);

	const project = projectManager.project;

	const accessibleMembers = $derived(
		project?.team.filter((member) => member.username !== project.ownerId) ?? []
	);
	const visibleAccessibleMembers = $derived(accessibleMembers.slice(0, 3));
	const additionalAccessibleCount = $derived(
		Math.max(accessibleMembers.length - visibleAccessibleMembers.length, 0)
	);

	function getMemberName(username: string) {
		const user = session.users.all.find((item) => item.username === username);
		return user?.fullname || username;
	}

	function accessibleSummary() {
		if (accessibleMembers.length === 0) return 'No collaborators were added to this project';

		const names = visibleAccessibleMembers
			.map((member) => getMemberName(member.username))
			.filter(Boolean);

		// If only two, show A and B:
		if (names.length === 1) return `Also accessible by ${names[0]}`;
		if (names.length === 2) return `Also accessible by ${names[0]} and ${names[1]}`;
		// If more than 3, show A, B, C, and X others:
		return `Also accessible by ${names[0]}, ${names[1]}, ${names[2]}, and ${additionalAccessibleCount} other${additionalAccessibleCount === 1 ? '' : 's'}`;
	}
</script>

{#if project}
	<div class="">
		<div class="flex w-full flex-1 flex-col gap-3 p-1">
			<label class="space-y-1">
				<div class="flex items-center justify-between gap-4">
					<Input
						class="h-auto border-none bg-transparent p-0 text-2xl font-semibold tracking-normal shadow-none focus-visible:ring-0 disabled:opacity-100"
						bind:value={project.name}
						oninput={debounce(() => {
							projectManager.update();
						}, 500)}
						placeholder="Enter project name..."
						disabled={!projectManager.currentUser.isEditor}
					/>
					<ProjectMembers />
				</div>
			</label>
			<div class="flex items-center gap-1.5 text-sm text-muted-foreground">
				<span
					>Owned by {getMemberName(project.ownerId)}. {accessibleSummary()}. Click the "Manage Team"
					button to add more collaborators to this project.</span
				>
			</div>

			<Tiptap
				class="min-h-1 border-none bg-transparent shadow-none"
				editorClasses="p-0"
				bind:value={project.description}
				oninput={() => {
					projectManager.update();
				}}
				inputDebounceAmount={5000}
				disabled={!projectManager.currentUser.isEditor}
				placeholder="Enter project description..."
			/>
		</div>
	</div>
{/if}
