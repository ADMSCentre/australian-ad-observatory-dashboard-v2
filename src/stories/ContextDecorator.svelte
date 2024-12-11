<script lang="ts">
	import ToastsContainer from '$lib/components/toasts/toasts-container.svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div>
	{@render children()}
	<ToastsContainer />
</div>

<style>
	div {
		margin: 3em;
	}
</style>
