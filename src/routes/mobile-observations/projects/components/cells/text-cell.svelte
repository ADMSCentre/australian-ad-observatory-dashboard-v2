<script lang="ts">
	import Tiptap from '$lib/components/tiptap.svelte';
	import { PROJECT_MANAGER, ProjectManager } from 'mobile-observations/projects/manager.svelte';
	import { getContext } from 'svelte';

	let { content = $bindable() }: { content: string } = $props();
	const projectManager = (getContext(PROJECT_MANAGER) as () => ProjectManager | undefined)();
	if (!projectManager)
		throw new Error(
			'Project Manager not found. This component must be rendered inside a ProjectPage component.'
		);
</script>

<!-- <p>{content}</p> -->

<Tiptap
	class="h-full rounded border p-4 shadow"
	menus={{
		floating: false,
		bubble: false,
		toolbar: true
	}}
	placeholder="Enter text (Markdown supported)..."
	bind:value={content}
	oninput={(content) => {
		console.log(content);
		projectManager.update();
	}}
></Tiptap>
