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
		onsaved
	}: { query: Query; class?: string; onsaved?: (query: Query) => void } = $props();

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

<div class="flex flex-row items-center gap-2">
	<CodeMirror
		bind:value={queryStr}
		class={twMerge('w-full', className)}
		lineWrapping
		on:change={onChange}
		useTab={false}
		lang={sql()}
	/>
	<Button
		class="size-fit px-2 py-1 text-xs"
		size="sm"
		onclick={onSave}
		disabled={!isValid || !isEditing}>Save</Button
	>
</div>
