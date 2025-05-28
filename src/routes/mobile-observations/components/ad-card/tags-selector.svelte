<script lang="ts">
	import type { RichAdData } from '$lib/api/session/ads/types';
	import { session } from '$lib/api/session/session.svelte';
	import { type Tag } from '$lib/api/session/tags/index.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { PlusIcon } from 'lucide-svelte';
	import ColorSelector from 'mobile-observations/settings/components/color-selector.svelte';
	import CreateTagForm from 'mobile-observations/settings/components/create-tag-form.svelte';
	import { untrack } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	type Props = {
		adData: RichAdData;
		visible?: boolean;
		class?: string;
	};

	let { adData = $bindable() }: Props = $props();

	const isTagApplied = (tagId: string) => {
		return adData.tags?.includes(tagId);
	};

	const orderedTags = $derived.by(() => {
		return session.tags.all.toSorted((a, b) => {
			return a.name.localeCompare(b.name);
		});
	});

	$inspect('Ordered tags', orderedTags);

	const appliedTags = $derived.by(() => {
		return orderedTags.filter((tag) => isTagApplied(tag.id));
	});

	const unappliedTags = $derived.by(() => {
		return orderedTags.filter((tag) => !isTagApplied(tag.id));
	});

	const DEFAULT_TAG = {
		name: '',
		description: '',
		hex: '#6B7280'
	} as const;

	let newTag = $state<Omit<Tag, 'id'>>(DEFAULT_TAG);
	let isValid = $state<{
		color: boolean;
	}>({
		color: true
	});
	let loading = $state(false);
	let error = $state<string | null>(null);

	function showErrorMessage(message: string, timeout = 5000) {
		error = message;
		setTimeout(() => {
			error = null;
		}, timeout);
	}

	async function applyTag(tag: Tag) {
		const newTagIds = [...(adData.tags || []), tag.id];
		try {
			loading = true;
			await session.tags.applyToAd(adData, newTagIds);
		} catch (err) {
			const message = `Error applying tag: ${err instanceof Error ? err.message : 'Unknown error'}`;
			showErrorMessage(message);
		} finally {
			loading = false;
		}
	}

	async function removeTag(tag: Tag) {
		const newTagIds = adData.tags?.filter((id) => id !== tag.id) || [];
		try {
			loading = true;
			await session.tags.applyToAd(adData, newTagIds);
		} catch (err) {
			const message = `Error removing tag: ${err instanceof Error ? err.message : 'Unknown error'}`;
			showErrorMessage(message);
		} finally {
			loading = false;
		}
	}
</script>

{#snippet tag(tag: Tag)}
	<Button
		variant="ghost"
		class="group/tag-button relative flex size-fit items-center gap-2 overflow-clip rounded-md p-0"
		onclick={() => {
			if (isTagApplied(tag.id)) {
				removeTag(tag);
			} else {
				applyTag(tag);
			}
		}}
		disabled={loading}
	>
		<span
			class={twMerge(
				'z-10 inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs',
				isTagApplied(tag.id) && 'font-medium !text-white'
			)}
			style="color: {tag.hex};"
		>
			{tag.name}
		</span>
		<div
			class={twMerge(
				'absolute left-0 top-0 size-full opacity-0',
				isTagApplied(tag.id) && 'opacity-100 group-hover/tag-button:opacity-50'
			)}
			style="background-color: {tag.hex}"
		></div>
	</Button>
{/snippet}

{#if appliedTags.length > 0}
	<div class="flex flex-col gap-2">
		<p class="text-xs text-muted-foreground">Current tags (click to remove)</p>
		<div class="flex flex-wrap gap-2">
			{#each appliedTags as t}
				{@render tag(t)}
			{/each}
		</div>
	</div>
{/if}
{#if unappliedTags.length > 0}
	<div class="flex flex-col gap-2">
		<p class="text-xs text-muted-foreground">Click to apply one or more tags</p>
		<div class="flex flex-wrap gap-2">
			{#each unappliedTags as t}
				{@render tag(t)}
			{/each}
		</div>
	</div>
{/if}
{#if appliedTags.length === 0 && unappliedTags.length === 0}
	<p class="text-xs text-muted-foreground">No tags available</p>
{/if}

<!-- Create new tag form -->
<div class="flex flex-col gap-2">
	<p class="text-xs text-muted-foreground">Create a new tag</p>
	<CreateTagForm
		include={{ description: false, labels: false, prompt: false }}
		randomizerClasses={{
			raw: 'hidden',
			randomizer: 'p-1 size-fit'
		}}
		class="bg-transparent p-0"
		formClass="flex items-center w-full gap-1.5"
		inputClass="h-fit px-1 py-0.5"
		createButtonClass="size-6 rounded bg-primary p-1 aspect-square text-primary-foreground hover:opacity-90 disabled:opacity-15"
	>
		{#snippet createButtonContent()}
			+
		{/snippet}
	</CreateTagForm>
</div>
