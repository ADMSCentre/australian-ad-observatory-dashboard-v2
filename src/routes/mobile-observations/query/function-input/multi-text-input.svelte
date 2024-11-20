<script lang="ts">
	import type { Query } from '../const';

	let {
		query = $bindable(),
		inputRefs = $bindable()
	}: { query: Query; inputRefs: (HTMLInputElement | null)[] } = $props();

	const onAddSearchTerm = () => {
		query.args[query.args.length] = newInputValue;
		newInputValue = '';
	};

	let newInputValue = $state('');

	const onNewInputChange = (e: Event) => {
		const target = e.target as HTMLInputElement;
		newInputValue = target.value;
		if (newInputValue.trim() !== '') {
			onAddSearchTerm();
			setTimeout(() => {
				inputRefs[inputRefs.length - 1]?.focus();
			}, 0);
		}
	};
</script>

{#each query.args as arg, i}
	<input type="text" bind:this={inputRefs[i]} bind:value={query.args[i]} placeholder="+" />
{/each}
<input type="text" bind:value={newInputValue} oninput={onNewInputChange} placeholder="..." />

<style>
	input {
		field-sizing: content;
		@apply rounded border-b px-1 focus:outline-none;
	}
</style>
