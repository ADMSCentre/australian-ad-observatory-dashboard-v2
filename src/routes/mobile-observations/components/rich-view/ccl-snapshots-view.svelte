<script lang="ts">
	import { onMount } from 'svelte';
	import { client } from '$lib/api/client';
	import { auth } from '$lib/api/auth/auth.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { LoaderCircle, ChevronDown } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import type { CclSnapshot } from '$lib/types/ccl';
	import Codemirror from 'svelte-codemirror-editor';
	import { json } from '@codemirror/lang-json';

	let { observationId }: { observationId: string } = $props();

	let snapshots = $state<CclSnapshot[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		await loadSnapshots();
	});

	async function loadSnapshots() {
		loading = true;
		error = null;

		const observationIdWithoutTimestamp = observationId.split('.').slice(-1)[0]; // Handle cases where observationId might be in the format "timestamp.adId"

		try {
			const { data, error: apiError } = await client.GET('/ccl/snapshots', {
				params: {
					query: {
						observation_id: observationIdWithoutTimestamp,
						limit: 100 // No pagination needed - shouldn't be too many per observation
					}
				},
				headers: auth.headers
			});

			if (apiError || !data) {
				throw new Error((apiError as any)?.message || 'Failed to load CCL snapshots');
			}

			snapshots = (data.snapshots || []) as any as CclSnapshot[];
		} catch (e) {
			error = e instanceof Error ? e.message : 'An unknown error occurred';
			console.error('Error loading CCL snapshots:', e);
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
		if (snap.page_profile_picture_url) {
			return snap.page_profile_picture_url;
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

	const filteredSnapshots = $derived.by(() => {
		if (!snapshots) return [];
		return snapshots
			.filter((snapshot) => {
				// Example filter: only include active snapshots
				return snapshot.data.is_related_to_query_term;
			})
			.sort((a, b) => {
				// Sort by end date descending
				return (b.data.end_date || 0) - (a.data.end_date || 0);
			});
	});
</script>

<div class="flex flex-col gap-4 p-4">
	<!-- Loading state -->
	{#if loading}
		<div class="flex items-center justify-center gap-2 py-12 text-muted-foreground">
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
		<div class="flex h-40 items-center justify-center text-muted-foreground">
			<p>No CCL snapshots available for this observation.</p>
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
				Commercial Content Library enrichment data for this observation
			</p>
		</div>

		<Accordion.Root class="space-y-4" type="single">
			{#each filteredSnapshots as snapshot, idx (snapshot.id)}
				{@const previewImage = getPreviewImage(snapshot)}
				{@const bodyText = getBodyText(snapshot)}
				{@const firstCard = snapshot.data.snapshot.cards?.[0]}
				{@const snapshotData = snapshot.data.snapshot}

				<Accordion.Item value={`snapshot-${idx}`} class="rounded border-b-2 border-muted shadow">
					<Accordion.Trigger
						class="flex w-full items-start gap-4 px-4 py-3 hover:bg-primary/10 hover:no-underline"
					>
						<div class="flex w-full items-center gap-4 text-left">
							<!-- Preview image -->
							{#if previewImage}
								<div class="flex-shrink-0">
									<img
										src={previewImage}
										alt="Ad preview"
										class="h-16 w-16 rounded-md object-cover"
										loading="lazy"
										onerror={(e) => {
											(e.target as HTMLImageElement).style.display = 'none';
										}}
									/>
								</div>
							{/if}

							<div class="flex-1">
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
									{#if snapshot.data.publisher_platform && snapshot.data.publisher_platform.length > 0}
										{#each snapshot.data.publisher_platform as platform}
											<Badge variant="secondary" class="text-xs">{platform}</Badge>
										{/each}
									{/if}
									<span class="text-xs text-muted-foreground">
										{formatDate(snapshot.data.start_date)} — {formatDate(snapshot.data.end_date)}
									</span>
								</div>
							</div>
						</div>
					</Accordion.Trigger>

					<Accordion.Content class="px-4 pb-4">
						<div class="space-y-4 border-t pt-4">
							<!-- Metadata section -->
							<div class="space-y-3 rounded-lg bg-muted/40 p-4">
								<h4 class="font-semibold">Metadata</h4>

								<div class="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
									<div>
										<p class="text-xs font-semibold uppercase text-muted-foreground">Title</p>
										<p>{snapshotData.title || 'N/A'}</p>
									</div>

									<div>
										<p class="text-xs font-semibold uppercase text-muted-foreground">Body</p>
										<p class="line-clamp-3">{snapshotData.body?.text || 'N/A'}</p>
									</div>

									<div>
										<p class="text-xs font-semibold uppercase text-muted-foreground">CTA</p>
										<p>{snapshotData.cta_text || 'N/A'}</p>
									</div>

									<div>
										<p class="text-xs font-semibold uppercase text-muted-foreground">
											Display Format
										</p>
										<p>{snapshotData.display_format || 'N/A'}</p>
									</div>

									<div>
										<p class="text-xs font-semibold uppercase text-muted-foreground">Page Likes</p>
										<p>{snapshotData.page_like_count?.toLocaleString() ?? 'N/A'}</p>
									</div>

									<div>
										<p class="text-xs font-semibold uppercase text-muted-foreground">
											Collation Count
										</p>
										<p>{snapshot.data.collation_count?.toLocaleString() ?? 'N/A'}</p>
									</div>

									{#if snapshot.data.impressions_with_index?.impressions_text}
										<div>
											<p class="text-xs font-semibold uppercase text-muted-foreground">
												Impressions
											</p>
											<p>{snapshot.data.impressions_with_index.impressions_text}</p>
										</div>
									{/if}

									{#if snapshot.data.spend}
										<div>
											<p class="text-xs font-semibold uppercase text-muted-foreground">Spend</p>
											<p>
												{snapshot.data.spend}
												{snapshot.data.currency}
											</p>
										</div>
									{/if}

									{#if snapshot.data.reach_estimate}
										<div>
											<p class="text-xs font-semibold uppercase text-muted-foreground">
												Reach Estimate
											</p>
											<p>{snapshot.data.reach_estimate}</p>
										</div>
									{/if}

									{#if snapshotData.link_url}
										<div class="col-span-2">
											<p class="text-xs font-semibold uppercase text-muted-foreground">Link URL</p>
											<p class="break-all text-xs">
												<a
													href={snapshotData.link_url}
													target="_blank"
													rel="noopener noreferrer"
													class="underline">{snapshotData.link_url}</a
												>
											</p>
										</div>
									{/if}
								</div>

								{#if (snapshot.data.targeted_or_reached_countries?.length ?? 0) > 0}
									<div>
										<p class="text-xs font-semibold uppercase text-muted-foreground">
											Targeted Countries
										</p>
										<p class="text-sm">{snapshot.data.targeted_or_reached_countries.join(', ')}</p>
									</div>
								{/if}

								{#if (snapshotData.page_categories?.length ?? 0) > 0}
									<div>
										<p class="text-xs font-semibold uppercase text-muted-foreground">
											Page Categories
										</p>
										<div class="flex flex-wrap gap-1">
											{#each snapshotData.page_categories ?? [] as cat}
												<Badge variant="secondary" class="text-xs">{cat}</Badge>
											{/each}
										</div>
									</div>
								{/if}

								<div class="space-y-1 text-xs text-muted-foreground">
									<p><span class="font-medium">Page ID:</span> {snapshotData.page_id}</p>
									<p>
										<span class="font-medium">Ad Archive ID:</span>
										{snapshot.data.ad_archive_id}
									</p>
									<p>
										<span class="font-medium">Collation ID:</span>
										{snapshot.data.collation_id}
									</p>
								</div>
							</div>
							<!-- Cards -->
							{#each snapshotData.cards ?? [] as card, cardIdx}
								<div
									class="grid w-full grid-cols-[minmax(0,15rem)_minmax(0,1fr)] gap-4 space-y-3 rounded-lg border p-4"
								>
									<div class="flex flex-col gap-4">
										{#if card.resized_image_url}
											<img
												src={card.resized_image_url}
												alt={card.title || 'Card image'}
												class="h-auto w-full rounded-md"
												loading="lazy"
												onerror={(e) => {
													(e.target as HTMLImageElement).style.display = 'none';
												}}
											/>
										{/if}
										{#if card.video_sd_url}
											<video controls class="rounded-md">
												<source src={card.video_sd_url} type="video/mp4" />
												Your browser does not support the video tag.
												<track kind="captions" />
											</video>
										{/if}
									</div>

									<div class="flex flex-col gap-4">
										<h4 class="font-semibold">{card.title || 'Card ' + (cardIdx + 1)}</h4>
										{#if card.body}
											<p class="whitespace-pre-wrap text-sm text-muted-foreground">{card.body}</p>
										{/if}
										{#if card.caption}
											<p class="text-xs italic text-muted-foreground">{card.caption}</p>
										{/if}
										{#if card.cta_text}
											<p class="text-xs text-muted-foreground">
												<span class="font-medium">Call to Action:</span>
												<span class="rounded-full px-1 py-0.5">{card.cta_text}</span>
											</p>
										{/if}
										{#if card.link_url}
											<p class="truncate text-xs text-muted-foreground">
												<span class="font-medium">Link:</span>
												<a
													href={card.link_url}
													target="_blank"
													rel="noopener noreferrer"
													class="underline"
												>
													{card.link_url}
												</a>
											</p>
										{/if}
									</div>
								</div>
							{/each}

							<!-- Extra images -->
							{#if (snapshotData.images?.length ?? 0) > 0}
								<div>
									<h4 class="mb-3 font-semibold">Images</h4>
									<div class="grid grid-cols-2 gap-3">
										{#each snapshotData.images ?? [] as img}
											<img
												src={img.resized_image_url}
												alt="Ad preview"
												class="h-auto w-full rounded-md"
												loading="lazy"
												onerror={(e) => {
													(e.target as HTMLImageElement).style.display = 'none';
												}}
											/>
										{/each}
									</div>
								</div>
							{/if}

							<!-- Extra images from cards -->
							{#if (snapshotData.extra_images?.length ?? 0) > 0}
								<div>
									<h4 class="mb-3 font-semibold">Additional Images</h4>
									<div class="grid grid-cols-2 gap-3">
										{#each snapshotData.extra_images ?? [] as img}
											<img
												src={img.resized_image_url}
												alt="Additional content"
												class="h-auto w-full rounded-md"
												loading="lazy"
												onerror={(e) => {
													(e.target as HTMLImageElement).style.display = 'none';
												}}
											/>
										{/each}
									</div>
								</div>
							{/if}

							<!-- Raw JSON -->
							<div class="mt-4">
								<h4 class="mb-2 text-sm font-medium">Raw JSON</h4>
								<Codemirror
									class="max-h-96 overflow-auto text-left"
									lang={json()}
									lineWrapping
									value={JSON.stringify(snapshot, null, 2)}
									readonly
								/>
							</div>
						</div>
					</Accordion.Content>
				</Accordion.Item>
			{/each}
		</Accordion.Root>
	{/if}
</div>
