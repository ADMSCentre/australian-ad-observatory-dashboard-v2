<script lang="ts">
	import type { RichAdData } from '$lib/api/session/ads/types';
	import { session } from '$lib/api/session/session.svelte';
	import { type Tag } from '$lib/api/session/tags/index.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { ChevronDown, CircleX, GripVertical, SearchIcon, X } from 'lucide-svelte';
	import CreateTagForm from 'mobile-observations/settings/components/create-tag-form.svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { twMerge } from 'tailwind-merge';

	type Props = {
		adData: RichAdData;
		visible?: boolean;
		class?: string;
	};

	let { adData = $bindable(), class: className = '' }: Props = $props();

	const RECENT_TAGS_STORAGE_KEY = 'aao:recent-tag-ids';
	const RECENT_TAGS_MAX = 9;
	const AVAILABLE_COLLAPSE_THRESHOLD = 6;

	const isTagApplied = (tagId: string) => {
		return adData.tags?.includes(tagId);
	};

	const orderedTags = $derived.by(() => {
		return session.tags.all.toSorted((a, b) => {
			return a.name.localeCompare(b.name);
		});
	});

	const appliedTags = $derived.by(() => {
		return orderedTags.filter((tag) => isTagApplied(tag.id));
	});

	const unappliedTags = $derived.by(() => {
		return orderedTags.filter((tag) => !isTagApplied(tag.id));
	});

	const observationId = $derived(`${adData.timestamp}.${adData.adId}`);

	let searchQuery = $state('');
	let showAllAvailable = $state(false);
	let searchInputEl = $state<HTMLInputElement | null>(null);

	const filteredUnappliedTags = $derived.by(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!query) return unappliedTags;
		return unappliedTags.filter((tag) => tag.name.toLowerCase().includes(query));
	});

	const canCollapseAvailable = $derived(
		filteredUnappliedTags.length > AVAILABLE_COLLAPSE_THRESHOLD
	);

	let recentTagIds = $state<string[]>(loadRecentTagIds());
	let applyingTagIds = $state<string[]>([]);

	function loadRecentTagIds(): string[] {
		if (typeof localStorage === 'undefined') return [];
		try {
			const raw = localStorage.getItem(RECENT_TAGS_STORAGE_KEY);
			if (!raw) return [];
			const parsed = JSON.parse(raw);
			return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
		} catch {
			return [];
		}
	}

	function saveRecentTagIds(ids: string[]) {
		if (typeof localStorage === 'undefined') return;
		try {
			localStorage.setItem(RECENT_TAGS_STORAGE_KEY, JSON.stringify(ids));
		} catch {
			return;
		}
	}

	function pushRecent(tagId: string) {
		const next = [tagId, ...recentTagIds.filter((id) => id !== tagId)].slice(0, RECENT_TAGS_MAX);
		recentTagIds = next;
		saveRecentTagIds(next);
	}

	function removeFromRecent(tagId: string) {
		const next = recentTagIds.filter((id) => id !== tagId);
		recentTagIds = next;
		saveRecentTagIds(next);
	}

	const recentTags = $derived.by(() => {
		return recentTagIds
			.map((id, index) => {
				const tag = session.tags.getById(id);
				if (!tag) return null;
				return { tag, index };
			})
			.filter((entry): entry is { tag: Tag; index: number } => entry !== null);
	});

	const visibleRecentTags = $derived(recentTags.filter(({ tag }) => !isTagApplied(tag.id)));

	let draggedRecentIndex = $state<number | null>(null);

	function handleRecentDragStart(index: number, event: DragEvent) {
		draggedRecentIndex = index;
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('text/plain', String(index));
		}
	}

	function handleRecentDragOver(index: number, event: DragEvent) {
		if (draggedRecentIndex === null || draggedRecentIndex === index) return;
		event.preventDefault();
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}
	}

	function handleRecentDrop(index: number, event: DragEvent) {
		event.preventDefault();
		const from = draggedRecentIndex;
		draggedRecentIndex = null;
		if (from === null || from === index) return;
		const next = [...recentTagIds];
		const [moved] = next.splice(from, 1);
		next.splice(index, 0, moved);
		recentTagIds = next;
		saveRecentTagIds(next);
	}

	function handleRecentDragEnd() {
		draggedRecentIndex = null;
	}

	async function applyTag(tag: Tag) {
		if (applyingTagIds.includes(tag.id)) return;
		const previousTags = [...(adData.tags || [])];
		const newTagIds = [...previousTags, tag.id];
		adData.tags = newTagIds;
		applyingTagIds = [...applyingTagIds, tag.id];
		try {
			await session.tags.applyToAd(adData, newTagIds);
			pushRecent(tag.id);
		} catch {
			adData.tags = previousTags;
			toast.error(
				`Failed to apply tag ${tag.name} to observation ${observationId}. Please try again.`
			);
		} finally {
			applyingTagIds = applyingTagIds.filter((id) => id !== tag.id);
		}
	}

	async function removeTag(tag: Tag) {
		if (applyingTagIds.includes(tag.id)) return;
		const previousTags = [...(adData.tags || [])];
		const newTagIds = previousTags.filter((id) => id !== tag.id);
		adData.tags = newTagIds;
		applyingTagIds = [...applyingTagIds, tag.id];
		try {
			await session.tags.applyToAd(adData, newTagIds);
		} catch {
			adData.tags = previousTags;
			toast.error(
				`Failed to remove tag ${tag.name} from observation ${observationId}. Please try again.`
			);
		} finally {
			applyingTagIds = applyingTagIds.filter((id) => id !== tag.id);
		}
	}

	function handleShortcutKeydown(event: KeyboardEvent) {
		if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
		const match = event.code.match(/^(?:Digit|Numpad)([1-9])$/);
		if (!match) return;
		event.preventDefault();
		const index = Number(match[1]) - 1;
		const tagId = recentTagIds[index];
		if (!tagId || applyingTagIds.includes(tagId)) return;
		const tag = session.tags.getById(tagId);
		if (!tag) return;
		if (isTagApplied(tagId)) removeTag(tag);
		else applyTag(tag);
	}

	onMount(() => {
		const frame = requestAnimationFrame(() => searchInputEl?.focus());
		return () => cancelAnimationFrame(frame);
	});
</script>

<svelte:window onkeydown={handleShortcutKeydown} />

{#snippet tag(tag: Tag)}
	<Button
		variant="ghost"
		class={twMerge(
			'group/tag-button relative flex size-fit items-center gap-2 overflow-clip rounded-full p-0',
			applyingTagIds.includes(tag.id) && 'animate-pulse'
		)}
		onclick={() => {
			if (isTagApplied(tag.id)) {
				removeTag(tag);
			} else {
				applyTag(tag);
			}
		}}
		disabled={applyingTagIds.includes(tag.id)}
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

{#snippet recentTagRow(tag: Tag, storedIndex: number)}
	<div class="group/recent-item flex items-center gap-1">
		<div
			role="button"
			tabindex="0"
			aria-label="Apply tag {tag.name}"
			draggable="true"
			ondragstart={(e) => handleRecentDragStart(storedIndex, e)}
			ondragover={(e) => handleRecentDragOver(storedIndex, e)}
			ondrop={(e) => handleRecentDrop(storedIndex, e)}
			ondragend={handleRecentDragEnd}
			onclick={() => applyTag(tag)}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					applyTag(tag);
				}
			}}
			class={twMerge(
				'group/recent-tag flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md border border-border px-2 py-1 text-xs transition-colors',
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
				'hover:bg-muted/50',
				draggedRecentIndex === storedIndex && 'opacity-40'
			)}
		>
			<span
				class="size-2 shrink-0 rounded-sm"
				style="background-color: {tag.hex};"
				aria-hidden="true"
			></span>
			<span class="min-w-0 flex-1 truncate text-foreground">
				{tag.name}
			</span>
			<kbd
				class="ml-auto shrink-0 rounded border border-border bg-muted px-1 py-0.5 font-sans text-[10px] font-medium text-muted-foreground"
			>
				Alt + {storedIndex + 1}
			</kbd>
		</div>
		<Tooltip.Root>
			<Tooltip.Trigger
				type="button"
				aria-label="Remove from recent tags"
				onclick={() => removeFromRecent(tag.id)}
				class="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-opacity hover:bg-muted hover:text-foreground"
			>
				<X class="size-3.5" />
			</Tooltip.Trigger>
			<Tooltip.Content>Remove from recent tags</Tooltip.Content>
		</Tooltip.Root>
	</div>
{/snippet}

<div class={twMerge('flex w-full flex-col gap-3', className)}>
	<div class="relative">
		<SearchIcon
			class="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
		/>
		<Input
			bind:ref={searchInputEl}
			bind:value={searchQuery}
			type="text"
			placeholder="Type to search for a tag…"
			aria-label="Search available tags"
			class="h-8 pl-7 pr-7 text-sm"
		/>
		{#if searchQuery}
			<button
				type="button"
				class="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
				aria-label="Clear search"
				onclick={() => {
					searchQuery = '';
					searchInputEl?.focus();
				}}
			>
				<CircleX class="size-3.5" />
			</button>
		{/if}
	</div>

	{#if filteredUnappliedTags.length > 0}
		<div class="flex flex-col gap-2">
			<div class="flex items-center justify-between">
				<p class="text-xs font-medium text-muted-foreground">
					Available tags ({filteredUnappliedTags.length})
				</p>
				{#if canCollapseAvailable}
					<Button
						variant="link"
						size="sm"
						class="h-auto gap-1 p-0 text-xs text-muted-foreground hover:text-foreground hover:no-underline"
						onclick={() => (showAllAvailable = !showAllAvailable)}
					>
						{showAllAvailable ? 'Show less' : 'Show all'}
						<ChevronDown
							class={twMerge('transition-transform', showAllAvailable && 'rotate-180')}
						/>
					</Button>
				{/if}
			</div>
			<div
				class={twMerge(
					'flex flex-wrap gap-2 overflow-y-auto transition-[max-height] duration-200 ease-out',
					showAllAvailable || !canCollapseAvailable ? 'max-h-[28rem] ' : 'max-h-12'
				)}
			>
				{#each filteredUnappliedTags as t (t.id)}
					{@render tag(t)}
				{/each}
			</div>
		</div>
	{:else if searchQuery.trim()}
		<p class="text-xs text-muted-foreground">No tags match "{searchQuery}"</p>
	{:else if appliedTags.length === 0 && unappliedTags.length === 0}
		<p class="text-xs text-muted-foreground">No tags available</p>
	{/if}

	{#if appliedTags.length > 0}
		<div class="flex flex-col gap-2">
			<p class="text-xs font-medium text-muted-foreground">Applied tags</p>
			<div class="flex flex-wrap gap-2">
				{#each appliedTags as t (t.id)}
					{@render tag(t)}
				{/each}
			</div>
		</div>
	{/if}

	{#if visibleRecentTags.length > 0}
		<div class="flex flex-col gap-1.5">
			<p class="text-xs font-medium text-muted-foreground">Recent tags</p>
			<p class="text-2xs text-muted-foreground">
				Click or use a keyboard shortcut to assign a tag you have recently used on this device. Drag
				to reorder.
			</p>
			<div class="flex flex-col gap-1">
				{#each visibleRecentTags as { tag, index } (tag.id)}
					{@render recentTagRow(tag, index)}
				{/each}
			</div>
		</div>
	{/if}

	<!-- Create new tag form -->
	<div class="flex flex-col gap-2 pt-1">
		<p class="text-xs font-medium text-muted-foreground">Create a new tag</p>
		<CreateTagForm
			include={{ description: false, labels: false, prompt: false }}
			randomizerClasses={{
				raw: 'hidden',
				randomizer: 'p-1 size-fit'
			}}
			class="bg-transparent p-0"
			formClass="flex items-center w-full gap-1.5"
			inputClass="h-8 px-2 py-1 text-sm"
			createButtonClass="size-8 rounded-md bg-primary p-1 aspect-square text-primary-foreground hover:opacity-90 disabled:opacity-15"
		>
			{#snippet createButtonContent()}
				+
			{/snippet}
		</CreateTagForm>
	</div>
</div>
