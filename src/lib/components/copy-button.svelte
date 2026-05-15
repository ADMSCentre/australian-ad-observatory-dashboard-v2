<script lang="ts">
	import { Check, Copy } from 'lucide-svelte';
	import Button from './ui/button/button.svelte';

	const {
		text
	}: {
		text: string;
	} = $props();

	let copied = $state(false);
</script>

<Button
	size="icon"
	variant={copied ? 'default' : 'outline'}
	class="size-8 shrink-0"
	aria-label={copied ? 'Copied' : 'Copy to clipboard'}
	onclick={() => {
		navigator.clipboard.writeText(text);
		copied = true;
	}}
>
	{#if !copied}
		<Copy class="size-4" />
	{:else}
		<Check class="size-4" />
	{/if}
</Button>
