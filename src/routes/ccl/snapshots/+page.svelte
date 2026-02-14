<script lang="ts">
	import { cclSnapshots } from '$lib/api/ccl.svelte';
	import { onMount } from 'svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { LoaderCircle, ChevronLeft, ChevronRight, Search } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import SnapshotDetailSheet from './snapshot-detail-sheet.svelte';
	import type { CclSnapshot } from '$lib/types/ccl';

	const PAGE_SIZE = 20;

	let selectedSnapshot = $state<CclSnapshot | null>(null);
	let searchQuery = $state('');
	let searchInput = $state('');
	let searchTimeout = $state<ReturnType<typeof setTimeout> | null>(null);

	onMount(() => {
		if (cclSnapshots.items.length === 0) {
			cclSnapshots.loadFirst({ limit: PAGE_SIZE });
		}
	});

	function handleSearch() {
		searchQuery = searchInput;
		cclSnapshots.clearCache();
		cclSnapshots.loadFirst({ limit: PAGE_SIZE, search: searchQuery || undefined });
	}

	function handleSearchInput(value: string) {
		searchInput = value;
		if (searchTimeout) clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => handleSearch(), 400);
	}

	function handleNext() {
		cclSnapshots.loadNext({ limit: PAGE_SIZE, search: searchQuery || undefined });
	}

	function handlePrevious() {
		cclSnapshots.loadPrevious({ limit: PAGE_SIZE, search: searchQuery || undefined });
	}

	// Client-side filtering for platform
	let platformFilter = $state('');

	const filteredSnapshots = $derived.by(() => {
		return cclSnapshots.items.filter((snapshot) => {
			const matchesPlatform =
				!platformFilter ||
				(snapshot.data.publisher_platform &&
					snapshot.data.publisher_platform.some(
						(p) => p.toLowerCase() === platformFilter.toLowerCase()
					));
			return matchesPlatform;
		});
	});

	// Collect unique platforms from current page
	const platforms = $derived.by(() => {
		const plats = new Set<string>();
		cclSnapshots.items.forEach((s) => {
			if (s.data.publisher_platform) {
				s.data.publisher_platform.forEach((p) => plats.add(p));
			}
		});
		return Array.from(plats).sort();
	});

	// Helper to get the best preview image
	function getPreviewImage(snapshot: CclSnapshot): string | null {
		const snap = snapshot.data.snapshot;
		if (snap.cards && snap.cards.length > 0 && snap.cards[0].resized_image_url) {
			return snap.cards[0].resized_image_url;
		}
		if (snap.images && snap.images.length > 0 && snap.images[0].resized_image_url) {
			return snap.images[0].resized_image_url;
		}
		return null;
	}

	// Helper to get the body text
	function getBodyText(snapshot: CclSnapshot): string {
		const snap = snapshot.data.snapshot;
		if (snap.cards && snap.cards.length > 0 && snap.cards[0].body) {
			return snap.cards[0].body;
		}
		if (snap.body?.text) {
			return snap.body.text;
		}
		return '';
	}

	// Helper to format dates from epoch seconds
	function formatDate(epoch: number): string {
		if (!epoch) return 'N/A';
		return new Date(epoch * 1000).toLocaleDateString('en-GB', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div class="flex flex-col gap-4">
	<!-- Search and filters -->
	<div class="flex flex-col gap-3 rounded-lg border bg-muted/40 p-4">
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
			<div class="relative">
				<Search class="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					type="text"
					placeholder="Search by page name..."
					value={searchInput}
					oninput={(e) => handleSearchInput((e.target as HTMLInputElement).value)}
					class="pl-8"
				/>
			</div>
			<select class="rounded-md border bg-background px-3 py-2 text-sm" bind:value={platformFilter}>
				<option value="">All Platforms</option>
				{#each platforms as platform}
					<option value={platform}>{platform}</option>
				{/each}
			</select>
			<div></div>
			<Button
				variant="outline"
				onclick={() => {
					platformFilter = '';
					searchInput = '';
					searchQuery = '';
					cclSnapshots.clearCache();
					cclSnapshots.loadFirst({ limit: PAGE_SIZE });
				}}
			>
				Clear Filters
			</Button>
		</div>
	</div>

	<!-- Header with counts -->
	<div class="flex items-center justify-between">
		<h2 class="text-xl font-semibold">
			Snapshots
			{#if cclSnapshots.total > 0}
				<span class="text-sm font-normal text-muted-foreground">
					(Page {cclSnapshots.currentPage} &middot; {cclSnapshots.total.toLocaleString()} total)
				</span>
			{/if}
		</h2>
		{#if cclSnapshots.loading}
			<div class="flex items-center gap-2 text-sm text-muted-foreground">
				<LoaderCircle class="h-4 w-4 animate-spin" />
				Loading...
			</div>
		{/if}
	</div>

	<!-- Error message -->
	{#if cclSnapshots.error}
		<div class="rounded-md border border-destructive/50 bg-destructive/10 p-4">
			<p class="text-sm font-medium text-destructive">Error loading snapshots</p>
			<p class="text-xs text-destructive/80">{cclSnapshots.error}</p>
			<Button
				variant="outline"
				size="sm"
				class="mt-2"
				onclick={() =>
					cclSnapshots.loadFirst({ limit: PAGE_SIZE, search: searchQuery || undefined })}
			>
				Retry
			</Button>
		</div>
	{/if}

	<!-- Empty state -->
	{#if !cclSnapshots.loading && filteredSnapshots.length === 0 && !cclSnapshots.error}
		<div class="flex h-40 items-center justify-center text-muted-foreground">
			<p>No snapshots found matching the current filters.</p>
		</div>
	{/if}

	<!-- Snapshots list (card-based layout) -->
	<div class="space-y-4">
		{#each filteredSnapshots as snapshot (snapshot.id)}
			{@const previewImage = getPreviewImage(snapshot)}
			{@const bodyText = getBodyText(snapshot)}
			{@const firstCard = snapshot.data.snapshot.cards?.[0]}
			<Card.Root
				class="cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
				onclick={() => (selectedSnapshot = snapshot)}
			>
				<div class="flex gap-4 p-4">
					<!-- Preview image -->
					{#if previewImage}
						<div class="flex-shrink-0">
							<img
								src={previewImage}
								alt="Ad preview"
								class="h-24 w-24 rounded-md object-cover"
								loading="lazy"
								onerror={(e) => {
									(e.target as HTMLImageElement).style.display = 'none';
								}}
							/>
						</div>
					{/if}

					<Card.Content class="flex-1 p-0">
						<!-- Page name -->
						<p class="text-xs text-muted-foreground">{snapshot.data.page_name}</p>
						<h3 class="mb-1 line-clamp-1 text-base font-semibold">
							{snapshot.data.snapshot.title || firstCard?.title || 'Untitled Ad'}
						</h3>

						<!-- Body preview -->
						{#if bodyText}
							<p class="mb-2 line-clamp-2 text-sm text-muted-foreground">
								{bodyText}
							</p>
						{/if}

						<!-- Metadata row -->
						<div class="flex flex-wrap items-center gap-2">
							{#if snapshot.data.is_active}
								<Badge
									variant="outline"
									class="border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-300"
								>
									Active
								</Badge>
							{:else}
								<Badge variant="secondary">Inactive</Badge>
							{/if}
							{#if firstCard?.cta_text}
								<Badge variant="outline" class="text-xs">
									{firstCard.cta_text}
								</Badge>
							{/if}
							{#if snapshot.data.publisher_platform && snapshot.data.publisher_platform.length > 0}
								{#each snapshot.data.publisher_platform as platform}
									<Badge variant="secondary" class="text-xs">{platform}</Badge>
								{/each}
							{/if}
							<span class="text-xs text-muted-foreground">
								{formatDate(snapshot.data.start_date)} — {formatDate(snapshot.data.end_date)}
							</span>
						</div>
					</Card.Content>
				</div>
			</Card.Root>
		{/each}
	</div>

	<!-- Pagination controls -->
	<div class="flex items-center justify-between border-t pt-4">
		<p class="text-sm text-muted-foreground">
			Page {cclSnapshots.currentPage}
			{#if cclSnapshots.total > 0}
				&middot; {cclSnapshots.total.toLocaleString()} total results
			{/if}
		</p>
		<div class="flex items-center gap-2">
			<Button
				variant="outline"
				size="sm"
				disabled={!cclSnapshots.hasPrevious || cclSnapshots.loading}
				onclick={handlePrevious}
			>
				<ChevronLeft class="mr-1 h-4 w-4" />
				Previous
			</Button>
			<Button
				variant="outline"
				size="sm"
				disabled={!cclSnapshots.hasMore || cclSnapshots.loading}
				onclick={handleNext}
			>
				Next
				<ChevronRight class="ml-1 h-4 w-4" />
			</Button>
		</div>
	</div>
</div>

<!-- Detail sheet modal -->
{#if selectedSnapshot}
	<SnapshotDetailSheet snapshot={selectedSnapshot} onClose={() => (selectedSnapshot = null)} />
{/if}
