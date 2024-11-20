<script lang="ts">
	import type { Query } from '../const';
	import MultiTextInput from '../function-input/multi-text-input.svelte';

	let {
		type,
		query = $bindable(),
		inputRefs = $bindable()
	}: {
		type: string;
		query: Query;
		inputRefs: (HTMLInputElement | null)[];
	} = $props();

	const Component = $derived.by(() => {
		switch (type) {
			case 'multi-text-input':
				return MultiTextInput;
			default:
				return null;
		}
	});
</script>

{#if Component}
	<Component bind:query bind:inputRefs />
{/if}
