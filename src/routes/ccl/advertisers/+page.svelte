<script lang="ts">
	import { cclEntities } from '$lib/api/ccl.svelte';
	import { onMount } from 'svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { LoaderCircle, ChevronLeft, ChevronRight, Search } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import EntityDetailSheet from './entity-detail-sheet.svelte';
	import type { CclEntity } from '$lib/types/ccl';

	const PAGE_SIZE = 20;

	let selectedEntity = $state<CclEntity | null>(null);
	let searchQuery = $state('');
	let searchInput = $state('');
	let searchTimeout = $state<ReturnType<typeof setTimeout> | null>(null);

	onMount(() => {
		if (cclEntities.items.length === 0) {
			cclEntities.loadFirst({ limit: PAGE_SIZE });
		}
	});

	function handleSearch() {
		searchQuery = searchInput;
		cclEntities.clearCache();
		cclEntities.loadFirst({ limit: PAGE_SIZE, search: searchQuery || undefined });
	}

	function handleSearchInput(value: string) {
		searchInput = value;
		if (searchTimeout) clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => handleSearch(), 400);
	}

	function handleNext() {
		cclEntities.loadNext({ limit: PAGE_SIZE, search: searchQuery || undefined });
	}

	function handlePrevious() {
		cclEntities.loadPrevious({ limit: PAGE_SIZE, search: searchQuery || undefined });
	}

	// Client-side filtering for category and verification
	let categoryFilter = $state('');
	let verificationFilter = $state('');

	const filteredEntities = $derived.by(() => {
		return cclEntities.items.filter((entity) => {
			const matchesCategory = !categoryFilter || entity.data.category === categoryFilter;
			const matchesVerification =
				!verificationFilter || entity.data.verification === verificationFilter;
			return matchesCategory && matchesVerification;
		});
	});

	// Collect unique categories from current page for filter dropdown
	const categories = $derived.by(() => {
		const cats = new Set<string>();
		cclEntities.items.forEach((e) => {
			if (e.data.category) cats.add(e.data.category);
		});
		return Array.from(cats).sort();
	});
</script>

<div class="flex flex-col gap-4">
	<!-- Search and filters -->
	<div class="flex flex-col gap-3 rounded-lg border bg-muted/40 p-4">
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
			<div class="relative">
				<Search class="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					type="text"
					placeholder="Search by name..."
					value={searchInput}
					oninput={(e) => handleSearchInput((e.target as HTMLInputElement).value)}
					class="pl-8"
				/>
			</div>
			<select class="rounded-md border bg-background px-3 py-2 text-sm" bind:value={categoryFilter}>
				<option value="">All Categories</option>
				{#each categories as cat}
					<option value={cat}>{cat}</option>
				{/each}
			</select>
			<select
				class="rounded-md border bg-background px-3 py-2 text-sm"
				bind:value={verificationFilter}
			>
				<option value="">All Verification</option>
				<option value="BLUE_VERIFIED">Blue Verified</option>
				<option value="NOT_VERIFIED">Not Verified</option>
			</select>
			<Button
				variant="outline"
				onclick={() => {
					categoryFilter = '';
					verificationFilter = '';
					searchInput = '';
					searchQuery = '';
					cclEntities.clearCache();
					cclEntities.loadFirst({ limit: PAGE_SIZE });
				}}
			>
				Clear Filters
			</Button>
		</div>
	</div>

	<!-- Header with counts -->
	<div class="flex items-center justify-between">
		<h2 class="text-xl font-semibold">Advertisers</h2>
		{#if cclEntities.loading}
			<div class="flex items-center gap-2 text-sm text-muted-foreground">
				<LoaderCircle class="h-4 w-4 animate-spin" />
				Loading...
			</div>
		{/if}
	</div>

	<!-- Error message -->
	{#if cclEntities.error}
		<div class="rounded-md border border-destructive/50 bg-destructive/10 p-4">
			<p class="text-sm font-medium text-destructive">Error loading entities</p>
			<p class="text-xs text-destructive/80">{cclEntities.error}</p>
			<Button
				variant="outline"
				size="sm"
				class="mt-2"
				onclick={() =>
					cclEntities.loadFirst({ limit: PAGE_SIZE, search: searchQuery || undefined })}
			>
				Retry
			</Button>
		</div>
	{/if}

	<!-- Empty state -->
	{#if !cclEntities.loading && filteredEntities.length === 0 && !cclEntities.error}
		<div class="flex h-40 items-center justify-center text-muted-foreground">
			<p>No advertisers found matching the current filters.</p>
		</div>
	{/if}

	<!-- Entities grid -->
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#each filteredEntities as entity (entity.id)}
			<Card.Root
				class="cursor-pointer transition-shadow hover:shadow-md"
				onclick={() => (selectedEntity = entity)}
			>
				<Card.Header class="pb-3">
					{#if entity.data.image_uri}
						<img
							src={entity.data.image_uri}
							alt={entity.name}
							class="mb-2 h-32 w-full rounded-md object-cover"
							loading="lazy"
							onerror={(e) => {
								(e.target as HTMLImageElement).style.display = 'none';
							}}
						/>
					{/if}
					<Card.Title class="truncate text-base">{entity.name}</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-2 pt-0">
					<div>
						<Badge variant="secondary" class="text-xs">
							{entity.data.category || 'Unknown'}
						</Badge>
					</div>
					<div class="space-y-1 text-sm text-muted-foreground">
						<p>{entity.data.likes?.toLocaleString() ?? 0} likes</p>
						{#if entity.data.ig_followers}
							<p>{entity.data.ig_followers.toLocaleString()} IG followers</p>
						{/if}
					</div>
					<div class="flex flex-wrap items-center gap-2">
						<Badge
							variant="outline"
							class="text-xs {entity.data.verification === 'BLUE_VERIFIED'
								? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300'
								: ''}"
						>
							{entity.data.verification === 'BLUE_VERIFIED' ? 'Verified' : 'Not Verified'}
						</Badge>
						{#if entity.data.country}
							<span class="text-xs text-muted-foreground">{entity.data.country}</span>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<!-- Pagination controls -->
	<div class="flex items-center justify-between border-t pt-4">
		<p class="text-sm text-muted-foreground">
			Page {cclEntities.currentPage}
		</p>
		<div class="flex items-center gap-2">
			<Button
				variant="outline"
				size="sm"
				disabled={!cclEntities.hasPrevious || cclEntities.loading}
				onclick={handlePrevious}
			>
				<ChevronLeft class="mr-1 h-4 w-4" />
				Previous
			</Button>
			<Button
				variant="outline"
				size="sm"
				disabled={!cclEntities.hasMore || cclEntities.loading}
				onclick={handleNext}
			>
				Next
				<ChevronRight class="ml-1 h-4 w-4" />
			</Button>
		</div>
	</div>
</div>

<!-- Detail sheet modal -->
{#if selectedEntity}
	<EntityDetailSheet entity={selectedEntity} onClose={() => (selectedEntity = null)} />
{/if}
