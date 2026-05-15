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
		if (target.value.trim() === '') {
			query.args.splice(i, 1);
			inputRefs.splice(i, 1);
		} else {
			query.args[i] = target.value;
		}
		debouncedOnChange?.(query);
	};
</script>

<div class="flex flex-wrap items-center gap-1 text-sm">
	{#each query.args as arg, i (i)}
		<input
			type="text"
			class="query-term-input"
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
		class="query-term-input"
		bind:value={newInputValue}
		oninput={onNewInputChange}
		placeholder="......."
		{disabled}
	/>
</div>

<style>
	input {
		field-sizing: content;
		min-width: 2.5rem;
		border: 1px solid hsl(var(--border));
		border-radius: 0.375rem;
		background: hsl(var(--background));
		padding: 0.25rem 0.5rem;
		color: hsl(var(--foreground));
		outline: none;
	}

	input:focus {
		border-color: rgb(252 211 77);
	}
</style>
