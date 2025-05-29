<script lang="ts">
	import Tiptap from '$lib/components/tiptap.svelte';
	import { PROJECT_MANAGER, ProjectManager } from 'mobile-observations/projects/manager.svelte';
	import type { TextCell } from 'mobile-observations/projects/types';
	import { getContext } from 'svelte';

	let { cell = $bindable() }: { cell: TextCell } = $props();
	const projectManager = (getContext(PROJECT_MANAGER) as () => ProjectManager | undefined)();
	if (!projectManager)
		throw new Error(
			'Project Manager not found. This component must be rendered inside a ProjectPage component.'
		);

	const originalContent = cell.content;
</script>

<!-- <p>{content}</p> -->

<Tiptap
	class="h-full rounded border border-transparent leading-loose hover:shadow"
	menus={{
		floating: false,
		bubble: false,
		toolbar: true
	}}
	placeholder="Enter text (Markdown supported)..."
	bind:value={cell.content}
	oninput={(content) => {
		console.log('TextCell content changed:', content);
		cell.hasChanges = originalContent !== content;
	}}
	disabled={!projectManager.currentUser.isEditor}
></Tiptap>
