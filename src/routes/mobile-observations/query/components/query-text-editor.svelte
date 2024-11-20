<script lang="ts">
	import type { Query } from '../const';
	import treeToString, { buildTree } from '../utils/query-builder';
	import CodeMirror from 'svelte-codemirror-editor';
	import Button from '$lib/components/ui/button/button.svelte';
	import { twMerge } from 'tailwind-merge';
	import { sql } from '@codemirror/lang-sql';

	let { query = $bindable(), class: className = '' }: { query: Query; class?: string } = $props();

	const queryToString = (query: Query): string => {
		return treeToString(query).replace(/^\((.*)\)$/, '$1');
	};

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
		console.log('Saving', queryStr);
		query = buildTree(queryStr);
		isEditing = false;
	};

	$effect(() => {
		const nextQueryStr = queryToString(query);
		console.log('nextQueryStr', nextQueryStr);
		if (queryStr === nextQueryStr) return;
		console.log('isEditing', isEditing);
		if (isEditing) return;
		console.log('isValid', isValid);
		if (!isValid) return;
		queryStr = nextQueryStr;
	});
</script>

<div class="flex flex-row gap-2">
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
