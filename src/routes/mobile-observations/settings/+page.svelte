<script lang="ts">
	import type { Tag } from '$lib/api/session/tags/index.svelte';
	import { EllipsisIcon } from 'lucide-svelte';
	import { session } from '$lib/api/session/session.svelte';

	const DEFAULT_TAG = {
		name: '',
		description: '',
		hex: '#6B7280'
	} as const;

	let newTag = $state<Omit<Tag, 'id'>>(DEFAULT_TAG);

	async function addTag() {
		const { name } = newTag;
		if (!name) return;
		await session.tags.create(newTag);
		newTag = DEFAULT_TAG;
	}
</script>

<div class="flex flex-col gap-4">
	<h1 class="text-2xl font-semibold">Settings</h1>
	<h2 class="text-lg font-medium">Tags</h2>
	<p class="text-sm text-gray-500">Tags can be used to label and categorise the observations.</p>

	{#each session.tags.all as tag (tag.id)}
		<div class="grid grid-cols-[1fr_8fr_1fr] items-center justify-between rounded-md border p-2">
			<span
				class="inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
				style="background-color: {tag.hex}"
			>
				{tag.name}
			</span>
			<p class="ml-4 flex-1 text-sm text-gray-700">
				{tag.description}
			</p>
			<button class="px-2 text-gray-400 hover:text-gray-600">
				<EllipsisIcon class="h-4 w-4" />
			</button>
		</div>
	{/each}

	<div class="mt-4 flex items-center space-x-2">
		<input
			type="text"
			bind:value={newTag.name}
			placeholder="New tag name"
			class="flex-1 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:ring-primary"
		/>
		<button
			onclick={addTag}
			class="rounded bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
		>
			Add
		</button>
	</div>
</div>
