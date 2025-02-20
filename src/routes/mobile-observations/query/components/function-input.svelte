<script lang="ts">
	import DatetimeInput from '../function-input/datetime-input.svelte';
	import MultiTextInput from '../function-input/multi-text-input.svelte';
	import type { Query } from '../query';

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
			case 'multi-text':
				return MultiTextInput;
			case 'datetime':
				return DatetimeInput;
			default:
				return null;
		}
	});
</script>

{#if Component}
	<Component bind:query bind:inputRefs />
{/if}
