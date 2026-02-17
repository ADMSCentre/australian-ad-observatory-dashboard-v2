<script lang="ts">
	import { cclSnapshots } from '$lib/api/ccl.svelte';
	import { onMount } from 'svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { LoaderCircle } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import type { CclSnapshot } from '$lib/types/ccl';
	import Codemirror from 'svelte-codemirror-editor';
	import { json } from '@codemirror/lang-json';
	import { twMerge } from 'tailwind-merge';
	import RelatedObservations from 'mobile-observations/components/rich-view/components/related-observations.svelte';
	import { WindowVirtualizer } from 'virtua/svelte';

	const PAGE_SIZE = 20;
	onMount(() => {
		if (cclSnapshots.items.length === 0) {
			cclSnapshots.loadFirst({ limit: PAGE_SIZE });
		}
	});

	const filteredSnapshots = $derived.by(() => {
		return cclSnapshots.items;
	});

	// Helper to get the best preview image
	function getPreviewImage(snapshot: CclSnapshot): string | null {
		const snap = snapshot.data.snapshot;
		if (!snapshot.data.is_related_to_query_term) {
			return null;
		}
		if (snap.cards && snap.cards.length > 0 && snap.cards[0].resized_image_url) {
			return snap.cards[0].resized_image_url;
		}
		if (snap.images && snap.images.length > 0 && snap.images[0].resized_image_url) {
			return snap.images[0].resized_image_url;
		}
		if (snap.images && snap.images.length > 0 && snap.images[0].resized_image_url) {
			return snap.images[0].resized_image_url;
		}
		if (snap.page_profile_picture_url) {
			return snap.page_profile_picture_url;
		}
		return null;
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

	function getProductTitle(snapshot: CclSnapshot): string {
		const snap = snapshot.data.snapshot;
		// Handle cases where the title is a placeholder like "{{product.name}}"
		if (!snap.title || snap.title === '{{product.name}}') {
			return snap.cards?.[0]?.title || 'Untitled Ad';
		}
		return snap.title;
	}

	function getProductBody(snapshot: CclSnapshot): string {
		const snap = snapshot.data.snapshot;
		// Handle cases where the body is a placeholder like "{{product.brand}}"
		if (!snap.body?.text || snap.body.text === '{{product.brand}}') {
			return snap.cards?.[0]?.body || '';
		}
		return snap.body.text;
	}

	function getRelatedObservations(snapshot: CclSnapshot): string[] {
		return snapshot.observed_in || [];
	}

	let vlist = $state<WindowVirtualizer<CclSnapshot>>();
	let expandedSnapshotIndices = $state<string[]>();
</script>

<div class="flex flex-col gap-4">
	<!-- Header with counts -->
	<div class="flex items-center justify-between">
		<h2 class="text-xl font-semibold">Snapshots</h2>
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
				onclick={() => cclSnapshots.loadFirst({ limit: PAGE_SIZE })}
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

	<!-- Snapshots list -->
	<Accordion.Root class="space-y-4" type="multiple" bind:value={expandedSnapshotIndices}>
		<WindowVirtualizer
			data={filteredSnapshots}
			itemSize={200}
			overscan={5}
			bind:this={vlist}
			onscroll={async () => {
				const endIndex = vlist?.findEndIndex();
				if (endIndex === undefined) return;
				// If we're within 5 items of the end, load more
				if (
					endIndex >= filteredSnapshots.length - 1 &&
					!cclSnapshots.loading &&
					cclSnapshots.hasMore
				) {
					await cclSnapshots.loadNext({ limit: PAGE_SIZE }, 'append');
				}
			}}
		>
			{#snippet children(snapshot, idx)}
				{@const previewImage = getPreviewImage(snapshot)}
				{@const bodyText = getProductBody(snapshot)}
				{@const snapshotData = snapshot.data.snapshot}
				{@const observationIds = getRelatedObservations(snapshot)}

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
								<div class="flex items-center gap-2">
									<!-- Page name -->
									<p class="text-xs text-muted-foreground">{snapshot.data.page_name}</p>
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
									<!-- Categories -->
									{#if snapshot.data.categories.length > 0}
										{#each snapshot.data.categories as category}
											<Badge variant="outline" class="text-xs">{category}</Badge>
										{/each}
									{/if}
								</div>
								<h3 class="mb-1 line-clamp-1 text-base font-semibold">
									{getProductTitle(snapshot)}
								</h3>

								<!-- Body preview -->
								{#if bodyText}
									<p class="mb-2 line-clamp-2 text-sm text-muted-foreground">
										{bodyText}
									</p>
								{/if}
								<div class="flex flex-wrap items-center gap-4">
									<span class="text-xs text-muted-foreground">
										{formatDate(snapshot.data.start_date)} — {formatDate(snapshot.data.end_date)}
									</span>
									{#if observationIds.length > 0}
										<span class="text-xs text-muted-foreground">
											Seen in {observationIds.length} observation{observationIds.length > 1
												? 's'
												: ''}
										</span>
									{/if}
									<!-- Low relevance -->
									{#if !snapshot.data.is_related_to_query_term}
										<Badge variant="outline" class="border-destructive text-xs text-destructive"
											>Low relevance</Badge
										>
									{/if}
								</div>
							</div>
						</div>
					</Accordion.Trigger>

					<Accordion.Content class="px-4 pb-4">
						<div class="space-y-4 border-t pt-4">
							<!-- Metadata section -->
							<div
								class={twMerge(
									'grid gap-4',
									(snapshotData.images?.length ?? 0) > 0 || (snapshotData.videos?.length ?? 0) > 0
										? 'md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]'
										: 'md:grid-cols-1'
								)}
							>
								<div class="space-y-4">
									<!-- Images -->
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

									<!-- Videos -->
									{#if (snapshotData.videos?.length ?? 0) > 0}
										<div>
											<h4 class="mb-3 font-semibold">Videos</h4>
											<div class="flex gap-4 overflow-x-auto">
												{#each snapshotData.videos ?? [] as video}
													<video controls class="w-full max-w-sm rounded-md">
														<source src={video.video_sd_url as string} type="video/mp4" />
														Your browser does not support the video tag.
														<track kind="captions" />
													</video>
												{/each}
											</div>
										</div>
									{/if}
								</div>

								<div class="space-y-4">
									<h4 class="font-semibold">Snapshot Details</h4>
									<div class="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
										<div>
											<p class="text-xs font-semibold uppercase text-muted-foreground">Title</p>
											<p>
												{getProductTitle(snapshot)}
											</p>
										</div>
										<div class="col-span-2">
											<p class="text-xs font-semibold uppercase text-muted-foreground">Body</p>
											<p class="line-clamp-3">
												{getProductBody(snapshot) || 'N/A'}
											</p>
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
										<!-- Page profile with uri -->
										{#if snapshot.data.page_name}
											<div>
												<p class="text-xs font-semibold uppercase text-muted-foreground">
													Page Profile
												</p>
												<p>
													<a
														href={snapshot.data.snapshot.page_profile_uri}
														target="_blank"
														rel="noopener noreferrer"
														class="underline"
													>
														{snapshot.data.page_name ||
															snapshot.data.snapshot.page_profile_uri ||
															'N/A'}
													</a>
												</p>
											</div>
										{/if}
										<div>
											<p class="text-xs font-semibold uppercase text-muted-foreground">
												Page Likes
											</p>
											<p>{snapshotData.page_like_count?.toLocaleString() ?? 'N/A'}</p>
										</div>
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
										<!-- Publisher platforms -->
										{#if snapshot.data.publisher_platform && snapshot.data.publisher_platform.length > 0}
											<div>
												<p class="text-xs font-semibold uppercase text-muted-foreground">
													Publisher Platforms
												</p>
												<div class="flex flex-wrap gap-1">
													{#each snapshot.data.publisher_platform as platform}
														<Badge variant="secondary" class="text-xs">{platform}</Badge>
													{/each}
												</div>
											</div>
										{/if}
										{#if snapshotData.link_url}
											<div class="col-span-2">
												<p class="text-xs font-semibold uppercase text-muted-foreground">
													Link URL
												</p>
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
											<p class="text-sm">
												{snapshot.data.targeted_or_reached_countries.join(', ')}
											</p>
										</div>
									{/if}
									<div class="grid grid-cols-3 gap-1 text-2xs text-muted-foreground">
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

							<!-- Related Observations -->
							<div>
								<h4 class="mb-3 font-semibold">Related Observations</h4>
								{#if observationIds.length === 0}
									<p class="text-sm text-muted-foreground">
										No related observations found for this snapshot.
									</p>
								{:else if expandedSnapshotIndices && expandedSnapshotIndices.includes(`snapshot-${idx}`)}
									<p class="mb-2 text-xs text-muted-foreground">
										The following observations are considered related to this snapshot. Some of
										these observations may be from the same ad seen at different times or on
										different platforms, while others may be from different ads that share similar
										attributes (e.g. same page name or similar content).
									</p>
									<RelatedObservations relatedObservationIds={observationIds} />
								{/if}
							</div>

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
			{/snippet}
		</WindowVirtualizer>
	</Accordion.Root>
	<div class="mb-6 flex items-center justify-center">
		{#if cclSnapshots.loading}
			<div class="flex items-center gap-2 text-sm text-muted-foreground">
				<LoaderCircle class="h-4 w-4 animate-spin" />
				Loading...
			</div>
		{/if}
	</div>
</div>
