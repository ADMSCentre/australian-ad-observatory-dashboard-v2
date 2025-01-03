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
	onclick={() => {
		navigator.clipboard.writeText(text);
		copied = true;
	}}
>
	{#if !copied}
		<Copy />
	{:else}
		<Check />
	{/if}
</Button>
