<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { DEFAULT_QUERY, getMethodType, type Query } from '../query';
	import MethodSelect from './method-select.svelte';
	import QueryBuilder from './query-builder.svelte';
	import { twMerge } from 'tailwind-merge';
	import FunctionInput from './function-input.svelte';
	import { METHODS } from '../query';
	import { slide } from 'svelte/transition';

	let {
		query = $bindable(),
		class: className = '',
		onchange,
		debouncedOnChange,
		disabled = false
	}: {
		query: Query;
		class?: string;
		onchange?: (query: Query) => void;
		debouncedOnChange?: (query: Query) => void;
		disabled?: boolean;
	} = $props();
	const methodType = $derived(getMethodType(query.method));
	let inputRefs = $state<(HTMLInputElement | null)[]>([]);

	$effect(() => {
		// When the query method changes, reset the args
		if (methodType === 'unary') {
			// If the args already exist, and is a valid Query object, do nothing
			if (query.args.length === 1 && typeof query.args[0] === 'object') {
				return;
			}
			query.args = [DEFAULT_QUERY];
		} else if (methodType === 'binary') {
			// If the args already exist, and are valid Query objects, do nothing
			if (query.args.length === 2 && query.args.every((arg) => typeof arg === 'object')) {
				return;
			}
			// If the args already exist, but are not Query objects, reset them or add them
			for (let i = 0; i < 2; i += 1) {
				if (query.args[i] && typeof query.args[i] === 'object') {
					continue;
				}
				query.args[i] = DEFAULT_QUERY;
			}
		}
	});

	const flexDirection = $derived.by(() => {
		const method = query.method;
		if (method === 'OR') {
			return 'flex-col';
		}
		return 'flex-row';
	});

	const functionInputType = $derived.by(() => {
		if (methodType !== 'function') return null;
		return Object.values(METHODS).find((m) => m.value === query.method)?.inputType || null;
	});

	/**
	 * Add an AND query to the current query, and make the current query the first argument
	 * of the AND query.
	 */
	const addAnd = () => {
		query = {
			method: 'AND',
			args: [query, DEFAULT_QUERY]
		};
	};

	const addOr = () => {
		query = {
			method: 'OR',
			args: [query, DEFAULT_QUERY]
		};
	};

	$effect(() => {
		// For monitoring changes in the query method (switching from a method to another)

		// Clearing a method with queries as their args make the first query the new query
		if (query.method === '' && query.args.length > 0 && typeof query.args[0] === 'object') {
			query = query.args[0] as Query;
		}
		// Clear the args when deleting the method
		if (query.method === '' && query.args.length > 0) {
			query.args = [];
		}
	});

	const debounced = (fn: (query: Query) => void, delay = 1000) => {
		let timeoutId: ReturnType<typeof setTimeout>;
		return (query: Query) => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				fn(query);
			}, delay);
		};
	};
	// const debouncedOnChange = debounced((query) => {
	// 	onchange?.(query);
	// }, 300);
	if (!debouncedOnChange) {
		debouncedOnChange = debounced((query) => {
			onchange?.(query);
		}, 300);
	}

	const originalQueryContent = JSON.stringify(query);

	$effect(() => {
		if (JSON.stringify(query) !== originalQueryContent) {
			// If the query has changed, call the debounced onchange function
			debouncedOnChange(query);
		}
	});

	let showAndOr = $state(false);

	const toggleShowAndOr = (e: MouseEvent, show: boolean) => {
		// Check if the event is coming from a child element
		e.stopPropagation();
		showAndOr = show;
	};
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="relative flex w-fit flex-col items-center gap-1 p-2"
	onmouseenter={(e) => toggleShowAndOr(e, true)}
	onmouseleave={(e) => toggleShowAndOr(e, false)}
	onclick={(e) => {
		e.stopPropagation();
		e.preventDefault();
	}}
>
	<div class=" flex items-center gap-1">
		<div
			class={twMerge(
				'relative flex w-fit items-center gap-2 rounded border border-dashed',
				flexDirection,
				methodType === 'function' && 'border-none',
				className
			)}
		>
			{#if methodType === 'binary' && query.args.length > 1}
				<QueryBuilder bind:query={query.args[0] as Query} {debouncedOnChange} {disabled} />
			{/if}
			<MethodSelect bind:query {disabled} />
			{#if methodType === 'unary' && query.args.length > 0}
				<QueryBuilder bind:query={query.args[0] as Query} {debouncedOnChange} {disabled} />
			{/if}
			{#if methodType === 'binary' && query.args.length > 1}
				<QueryBuilder bind:query={query.args[1] as Query} {debouncedOnChange} {disabled} />
			{/if}
			{#if methodType !== 'unary' && methodType !== 'binary' && functionInputType}
				<FunctionInput
					type={functionInputType}
					bind:query
					bind:inputRefs
					{debouncedOnChange}
					{disabled}
				/>
			{/if}
		</div>
		{#if showAndOr && !disabled}
			<div
				class="z-10 flex size-fit items-center justify-center"
				transition:slide={{ duration: 150, axis: 'x' }}
			>
				<Button
					variant="link"
					size="sm"
					class="pointer-events-auto size-fit p-0 text-2xs opacity-10 hover:opacity-100"
					onclick={addAnd}
				>
					+ AND
				</Button>
			</div>
		{/if}
	</div>
	{#if showAndOr && !disabled}
		<div class="z-10 -mt-3 size-fit" transition:slide={{ duration: 150, axis: 'y' }}>
			<Button
				variant="link"
				class="pointer-events-auto size-fit p-0 text-2xs opacity-10 hover:opacity-100"
				size="sm"
				onclick={addOr}
			>
				+ OR
			</Button>
		</div>
	{/if}
</div>
