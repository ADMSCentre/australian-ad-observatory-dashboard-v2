<script lang="ts">
	import type { Query } from '../query';

	let {
		query = $bindable(),
		inputRefs = $bindable(),
		debouncedOnChange,
		disabled = false
	}: {
		query: Query;
		inputRefs: (HTMLInputElement | null)[];
		debouncedOnChange?: (query: Query) => void;
		disabled?: boolean;
	} = $props();

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

	const onInputChange = (i: number) => (e: Event) => {
		const target = e.target as HTMLInputElement;
		console.log('input change', i, target.value);
		if (target.value.trim() === '') {
			console.log('removing', i);
			query.args.splice(i, 1);
			inputRefs.splice(i, 1);
		} else {
			query.args[i] = target.value;
		}
		debouncedOnChange?.(query);
	};
</script>

<div class="flex flex-wrap gap-1 text-sm">
	{#each query.args as arg, i}
		<input
			type="text"
			class="bg-background text-foreground"
			bind:this={inputRefs[i]}
			bind:value={query.args[i]}
			oninput={onInputChange(i)}
			placeholder="+"
			{disabled}
		/>
		{#if i < query.args.length - 1}
			<span class="text-foreground">,</span>
		{/if}
	{/each}
	<input
		type="text"
		class="bg-background text-foreground"
		bind:value={newInputValue}
		oninput={onNewInputChange}
		placeholder="......."
		{disabled}
	/>
</div>

<style>
	input {
		field-sizing: content;
		@apply rounded border-b focus:outline-none;
	}
</style>
