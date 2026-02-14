<script lang="ts">
	import { onMount } from 'svelte';
	import { client } from '$lib/api/client';
	import { auth } from '$lib/api/auth/auth.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { LoaderCircle } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import type { CclSnapshot } from '$lib/types/ccl';
	import SnapshotDetailSheet from '../../../ccl/snapshots/snapshot-detail-sheet.svelte';

	interface Props {
		observationId: string;
	}

	const { observationId }: Props = $props();

	let snapshots = $state<CclSnapshot[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let selectedSnapshot = $state<CclSnapshot | null>(null);

	onMount(() => {
		loadSnapshots();
	});

	async function loadSnapshots() {
		loading = true;
		error = null;

		try {
			const response = await client.GET('/ccl/snapshots', {
				params: {
					query: {
						observation_id: observationId,
						limit: 100 // No pagination needed for individual observations
					}
				},
				headers: auth.headers
			});

			if (response.error) {
				error = `Failed to load CCL snapshots: ${response.error}`;
				snapshots = [];
			} else if (response.data) {
				snapshots = response.data.snapshots || [];
			}
		} catch (err) {
			error = `Error loading CCL snapshots: ${err instanceof Error ? err.message : String(err)}`;
			snapshots = [];
		} finally {
			loading = false;
		}
	}

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

<div class="flex flex-col gap-4 p-4">
	<!-- Loading state -->
	{#if loading}
		<div class="flex items-center justify-center gap-2 p-8 text-muted-foreground">
			<LoaderCircle class="h-5 w-5 animate-spin" />
			<span>Loading CCL snapshots...</span>
		</div>
	{/if}

	<!-- Error state -->
	{#if error && !loading}
		<div class="rounded-md border border-destructive/50 bg-destructive/10 p-4">
			<p class="text-sm font-medium text-destructive">Error loading CCL snapshots</p>
			<p class="text-xs text-destructive/80">{error}</p>
			<Button variant="outline" size="sm" class="mt-2" onclick={loadSnapshots}>Retry</Button>
		</div>
	{/if}

	<!-- Empty state -->
	{#if !loading && !error && snapshots.length === 0}
		<div
			class="flex flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground"
		>
			<p class="text-sm font-medium">No CCL snapshots available</p>
			<p class="text-xs">This observation does not have any associated CCL enrichment data.</p>
		</div>
	{/if}

	<!-- Snapshots list -->
	{#if !loading && !error && snapshots.length > 0}
		<div class="mb-2">
			<h3 class="text-lg font-semibold">
				CCL Snapshots
				<span class="text-sm font-normal text-muted-foreground">
					({snapshots.length}
					{snapshots.length === 1 ? 'snapshot' : 'snapshots'})
				</span>
			</h3>
			<p class="text-sm text-muted-foreground">
				Commercial Content Library snapshots for this observation
			</p>
		</div>

		<div class="space-y-4">
			{#each snapshots as snapshot (snapshot.id)}
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
	{/if}
</div>

<!-- Detail sheet modal -->
{#if selectedSnapshot}
	<SnapshotDetailSheet snapshot={selectedSnapshot} onClose={() => (selectedSnapshot = null)} />
{/if}
