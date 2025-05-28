<script lang="ts">
	import type { Tag } from '$lib/api/session/tags/index.svelte';
	import { PenIcon, TrashIcon, XIcon, CheckIcon, LoaderIcon } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input';
	import ColorSelector from './color-selector.svelte';
	import { session } from '$lib/api/session/session.svelte';
	import { toast } from 'svelte-sonner';

	const { tag }: { tag: Tag } = $props();

	// Whether the tag is being edited or deleted
	let mode = $state<'edit' | 'delete' | 'view'>('view');
	let loading = $state(false);
	let error = $state<string | null>(null);

	function showErrorMessage(message: string, timeout = 5000) {
		error = message;
		setTimeout(() => {
			error = null;
		}, timeout);
	}

	// State for the edit mode
	let targetTag = $state<Tag>({ ...tag });
	let isValid = $state<{
		color: boolean;
	}>({
		color: true
	});

	const editTag = {
		start: () => {
			mode = 'edit';
		},
		confirm: async () => {
			try {
				loading = true;
				await session.tags.update(targetTag);
				toast.success(`Tag "${targetTag.name}" updated successfully`);
			} catch (err) {
				const message = `Error updating tag: ${err instanceof Error ? err.message : 'Unknown error'}`;
				showErrorMessage(message);
				toast.error(message);
			} finally {
				loading = false;
				mode = 'view';
			}
		},
		cancel: () => {
			targetTag = { ...tag };
			mode = 'view';
		}
	};

	const deleteTag = {
		start: () => {
			mode = 'delete';
		},
		confirm: async () => {
			try {
				loading = true;
				await session.tags.delete(tag.id);
				toast.success(`Tag "${tag.name}" deleted successfully`);
			} catch (err) {
				const message = `Error deleting tag: ${err instanceof Error ? err.message : 'Unknown error'}`;
				showErrorMessage(message);
				toast.error(message);
			} finally {
				loading = false;
				mode = 'view';
			}
		},
		cancel: () => {
			mode = 'view';
		}
	};
</script>

<div class="flex flex-col items-start gap-2 rounded-md border p-2">
	<div class="grid w-full grid-cols-[120px_auto_140px_120px] items-center gap-2">
		{#if mode === 'view'}
			<span
				class="inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
				style="background-color: {tag.hex}"
			>
				{tag.name}
			</span>
			<p class="col-span-2 ml-4 flex-1 text-sm">
				{tag.description}
			</p>
			<div class="flex items-center gap-2">
				<Button variant="ghost" size="icon" onclick={editTag.start}>
					<PenIcon />
				</Button>
				<Button variant="ghost" size="icon" onclick={deleteTag.start}>
					<TrashIcon />
				</Button>
			</div>
		{:else if mode === 'edit'}
			<Input bind:value={targetTag.name} class="w-full" placeholder="Tag name" />
			<div class="w-full">
				<Input bind:value={targetTag.description} placeholder="Description (optional)" />
			</div>
			<ColorSelector bind:hex={targetTag.hex} bind:isValid={isValid.color} />
			<div class="flex items-center gap-2">
				<Button variant="ghost" size="icon" onclick={editTag.cancel} disabled={loading}>
					<XIcon />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					onclick={editTag.confirm}
					disabled={!targetTag.name || !isValid.color || loading}
				>
					{#if loading}
						<LoaderIcon class="inline h-4 w-4 animate-spin" />
					{/if}
					{#if !loading}
						<CheckIcon />
					{/if}
				</Button>
			</div>
		{:else if mode === 'delete'}
			<span
				class="inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
				style="background-color: {tag.hex}"
			>
				{tag.name}
			</span>
			<p class="col-span-2 ml-4 flex-1 text-sm">
				{tag.description}
			</p>
			<div class="flex items-center gap-2">
				<Button variant="ghost" size="icon" onclick={deleteTag.cancel} disabled={loading}>
					<XIcon />
				</Button>
				<Button variant="destructive" size="icon" onclick={deleteTag.confirm} disabled={loading}>
					{#if loading}
						<LoaderIcon class="inline h-4 w-4 animate-spin" />
					{/if}
					{#if !loading}
						<TrashIcon />
					{/if}
				</Button>
			</div>
		{/if}
	</div>

	{#if error}
		<p class="text-sm text-red-500">{error}</p>
	{/if}
</div>
