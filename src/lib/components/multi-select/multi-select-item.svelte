<script lang="ts">
	import { XIcon } from 'lucide-svelte';
	import { twMerge } from 'tailwind-merge';

	const {
		option,
		onRemove,
		class: className = '',
		disabled = false
	}: {
		option: { value: any; label: string };
		onRemove?: (value: any) => void;
		class?: string;
		disabled?: boolean;
	} = $props();
</script>

<div
	class={twMerge(
		'inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground',
		className
	)}
>
	<span class="select-none truncate">{option.label || 'Unknown'}</span>
	{#if !disabled}
		<button
			type="button"
			class="rounded-full text-muted-foreground/60 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			aria-label="Remove {option.label || 'Unknown'}"
			onclick={(e) => {
				e.stopPropagation();
				onRemove?.(option.value);
			}}
		>
			<XIcon class="size-3" />
		</button>
	{/if}
</div>
