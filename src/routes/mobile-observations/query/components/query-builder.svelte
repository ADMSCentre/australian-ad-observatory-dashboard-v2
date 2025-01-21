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
</script>

<div class="relative flex w-fit flex-col items-center gap-1">
	<div class=" flex items-center gap-1">
		<div
			class={twMerge(
				'relative flex w-fit items-center gap-1 rounded border border-dashed p-2 pb-3 pr-8',
				flexDirection,
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
		<div
			class="pointer-events-none absolute left-full z-10 size-fit -translate-x-2/3 -translate-y-1 p-0.5"
		>
			<Button
				variant="link"
				size="sm"
				class="pointer-events-auto size-fit text-2xs opacity-10 hover:opacity-100"
				onclick={addAnd}
			>
				+ AND
			</Button>
		</div>
		<div
			class="pointer-events-none absolute bottom-0 z-10 size-fit w-full translate-y-1 text-center"
		>
			<Button
				variant="link"
				class="pointer-events-auto size-fit text-2xs opacity-10 hover:opacity-100"
				size="sm"
				onclick={addOr}
			>
				+ OR
			</Button>
		</div>
	</div>
</div>
