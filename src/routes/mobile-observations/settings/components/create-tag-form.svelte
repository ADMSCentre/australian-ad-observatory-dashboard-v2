<script lang="ts">
	import { session } from '$lib/api/session/session.svelte';
	import type { Tag } from '$lib/api/session/tags/index.svelte';
	import { Input } from '$lib/components/ui/input';
	import { LoaderIcon } from 'lucide-svelte';
	import ColorSelector, { type ColorSelectorProps } from './color-selector.svelte';
	import { fade } from 'svelte/transition';
	import { toast } from 'svelte-sonner';
	import type { Snippet } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import { Button } from '$lib/components/ui/button';

	const {
		include = {
			prompt: true,
			labels: true,
			description: true
		},
		createButtonContent = null,
		randomizerClasses,
		class: className = '',
		formClass = '',
		inputClass = '',
		createButtonClass = ''
	}: {
		include?: {
			prompt?: boolean;
			labels?: boolean;
			description?: boolean;
		};
		createButtonContent?: Snippet | null;
		randomizerClasses?: ColorSelectorProps['classes'];
		class?: string;
		formClass?: string;
		inputClass?: string;
		createButtonClass?: string;
	} = $props();

	const DEFAULT_TAG = {
		name: '',
		description: '',
		hex: '#6B7280'
	} as const;

	let loading = $state(false);
	let error = $state<string | null>(null);

	let newTag = $state<Omit<Tag, 'id'>>(DEFAULT_TAG);
	let isValid = $state<{
		color: boolean;
	}>({
		color: true
	});

	function showErrorMessage(message: string, timeout = 5000) {
		error = message;
		setTimeout(() => {
			error = null;
		}, timeout);
	}

	async function addTag() {
		const { name } = newTag;
		if (!name || !isValid.color) return;
		loading = true;
		try {
			await session.tags.create(newTag);
			toast.success(`Tag "${name}" created successfully`);
		} catch (err) {
			const message = `Error creating tag: ${err instanceof Error ? err.message : 'Unknown error'}`;
			showErrorMessage(message);
			toast.error(message);
		} finally {
			loading = false;
		}
		newTag = DEFAULT_TAG;
	}
</script>

<div class={twMerge('flex flex-col gap-4 bg-muted p-2', className)}>
	{#if include?.prompt}
		<p class="text-xs text-muted-foreground">
			You can change the tag name, description and color later.
		</p>
	{/if}
	<div class={twMerge('grid grid-cols-[120px_auto_140px_120px] items-end gap-2', formClass)}>
		<div class="flex w-full flex-col gap-1.5">
			{#if include?.labels}
				<label for="tag-name" class="text-sm font-medium">Tag Name</label>
			{/if}
			<Input id="tag-name" bind:value={newTag.name} class={inputClass} placeholder="Tag name" />
		</div>
		{#if include?.description}
			<div class="flex w-full flex-col gap-1.5">
				{#if include?.labels}
					<label for="tag-description" class="text-sm font-medium">Description</label>
				{/if}
				<Input
					id="tag-description"
					bind:value={newTag.description}
					placeholder="Description (optional)"
					class={inputClass}
				/>
			</div>
		{/if}
		<div class="flex flex-col gap-1.5">
			{#if include?.labels}
				<div class="text-sm font-medium">Color</div>
			{/if}
			<ColorSelector
				bind:hex={newTag.hex}
				bind:isValid={isValid.color}
				classes={randomizerClasses}
			/>
		</div>
		<div class="flex flex-col gap-1.5">
			<Button
				onclick={addTag}
				class={twMerge(
					'rounded bg-primary px-4 py-2 text-primary-foreground hover:opacity-90 disabled:opacity-50',
					createButtonClass
				)}
				disabled={!newTag.name || !isValid.color || loading}
			>
				{#if !loading}
					{#if createButtonContent}
						{@render createButtonContent()}
					{:else}
						Create Tag
					{/if}
				{/if}
				{#if loading}
					<LoaderIcon class="ml-2 inline h-4 w-4 animate-spin" />
				{/if}
			</Button>
		</div>
	</div>
	{#if error}
		<p class="text-sm text-red-500" transition:fade>
			{error}
		</p>
	{/if}
</div>
