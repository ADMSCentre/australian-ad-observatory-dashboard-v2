<script lang="ts">
	import type { Query } from '../query';
	import treeToString, { buildTree, queryToString } from '../utils/query-builder';
	import CodeMirror from 'svelte-codemirror-editor';
	import Button from '$lib/components/ui/button/button.svelte';
	import { twMerge } from 'tailwind-merge';
	import { sql } from '@codemirror/lang-sql';

	let {
		query = $bindable(),
		class: className = '',
		onsaved,
		disabled = false
	}: {
		query: Query;
		class?: string;
		onsaved?: (query: Query) => void;
		disabled?: boolean;
	} = $props();

	let queryStr = $state(queryToString(query));
	let tokens = $state<Query>();
	let isValid = $state(true);
	let isEditing = $state(false);

	const onChange = () => {
		isEditing = true;
		try {
			tokens = buildTree(queryStr);
			isValid = true;
		} catch (e) {
			console.error(e);
			isValid = false;
		}
	};

	const onSave = () => {
		query = buildTree(queryStr);
		isEditing = false;
		onsaved?.(query);
	};

	$effect(() => {
		const nextQueryStr = queryToString(query);
		if (queryStr === nextQueryStr) return;
		if (isEditing) return;
		if (!isValid) return;
		queryStr = nextQueryStr;
	});
</script>

<div class="flex flex-col gap-2 sm:flex-row sm:items-center">
	<CodeMirror
		bind:value={queryStr}
		class={twMerge('w-full overflow-hidden rounded-xl border border-border text-sm', className)}
		lineWrapping
		on:change={onChange}
		useTab={false}
		readonly={disabled}
	/>
	<Button
		class="h-9 shrink-0 px-3 text-xs font-medium"
		size="sm"
		onclick={onSave}
		disabled={!isValid || !isEditing}>Save</Button
	>
</div>
