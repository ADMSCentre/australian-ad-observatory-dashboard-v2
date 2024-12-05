<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ChevronDown } from 'lucide-svelte';
	import { slide } from 'svelte/transition';

	let {
		open = $bindable(false),
		summary,
		children,
		class: className
	}: {
		open?: boolean;
		summary: (open?: boolean) => ReturnType<Snippet>;
		children: Snippet;
		class?: string;
	} = $props();
</script>

<div class={className}>
	<button
		type="button"
		aria-expanded={open}
		aria-controls="accordion"
		aria-label="Toggle accordion"
		class="contents"
		onclick={() => (open = !open)}
	>
		{@render summary(open)}
	</button>
	{#if open}
		<div class="contents">
			{@render children()}
		</div>
	{/if}
</div>
