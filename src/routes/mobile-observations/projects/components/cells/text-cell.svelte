<script lang="ts">
	import Tiptap from '$lib/components/tiptap.svelte';

	let { content = $bindable() }: { content: string } = $props();
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
></Tiptap>
