<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { getMethodType, type Query } from '../const';
	import MethodSelect from './method-select.svelte';
	import QueryBuilder from './query-builder.svelte';
	import { twMerge } from 'tailwind-merge';
	import FunctionInput from './function-input.svelte';
	import { METHODS } from '../const';

	let { query = $bindable(), class: className = '' }: { query: Query; class?: string } = $props();
	const methodType = $derived(getMethodType(query.method));
	let inputRefs = $state<(HTMLInputElement | null)[]>([]);

	$effect(() => {
		// When the query method changes, reset the args
		if (methodType === 'unary') {
			// If the args already exist, and is a valid Query object, do nothing
			if (query.args.length === 1 && typeof query.args[0] === 'object') {
				return;
			}
			query.args = [
				{
					method: 'OBSERVER_ID_CONTAINS',
					args: []
				}
			];
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
				query.args[i] = {
					method: 'OBSERVER_ID_CONTAINS',
					args: []
				};
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
			args: [query, { method: 'OBSERVER_ID_CONTAINS', args: [] }]
		};
	};

	const addOr = () => {
		query = {
			method: 'OR',
			args: [query, { method: 'OBSERVER_ID_CONTAINS', args: [] }]
		};
	};

	$effect(() => {
		if (query.method === '' && query.args.length > 0 && typeof query.args[0] === 'object') {
			query = query.args[0] as Query;
		}
	});

	let showAndOr = $state(false);

	const toggleShowAndOr = (e: MouseEvent, show: boolean) => {
		// Check if the event is coming from a child element
		if (e.target !== e.currentTarget) return;
		e.preventDefault();
		e.stopPropagation();
		showAndOr = show;
	};
</script>

<label
	class="relative flex w-fit flex-col items-center gap-1"
	onmouseenter={(e) => toggleShowAndOr(e, true)}
	onmouseleave={(e) => toggleShowAndOr(e, false)}
>
	<div class=" flex items-center gap-1">
		<div
			class={twMerge(
				'relative flex w-fit items-center gap-2 rounded border border-dashed p-2',
				flexDirection,
				methodType === 'function' && 'border-none',
				className
			)}
		>
			{#if methodType === 'binary' && query.args.length > 1}
				<QueryBuilder bind:query={query.args[0] as Query} />
			{/if}
			<MethodSelect bind:value={query.method} />
			{#if methodType === 'unary' && query.args.length > 0}
				<QueryBuilder bind:query={query.args[0] as Query} />
			{/if}
			{#if methodType === 'binary' && query.args.length > 1}
				<QueryBuilder bind:query={query.args[1] as Query} />
			{/if}
			{#if methodType !== 'unary' && methodType !== 'binary' && functionInputType}
				<FunctionInput type={functionInputType} bind:query bind:inputRefs />
			{/if}
		</div>
		{#if showAndOr}
			<div class="z-10 -ml-5 flex size-fit items-center justify-center">
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
	{#if showAndOr}
		<div class="z-10 -mt-5 size-fit">
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
</label>
