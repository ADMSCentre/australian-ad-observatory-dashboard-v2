<script lang="ts">
	import { XIcon } from 'lucide-svelte';
	import { twMerge } from 'tailwind-merge';

	const {
		option,
		onRemove,
		class: className = ''
	}: {
		option: { value: any; label: string };
		onRemove?: (value: any) => void;
		class?: string;
	} = $props();
</script>

<div
	class={twMerge('flex items-center gap-0.5 rounded-md bg-muted px-1 py-0.5 text-xs', className)}
>
	<span class="select-none">{option.label || 'Unknown'}</span>
	<button
		class="text-muted-foreground/50 hover:text-muted-foreground"
		onclick={(e) => {
			e.stopPropagation();
			onRemove?.(option.value);
		}}
	>
		<XIcon class="size-3" />
	</button>
</div>
