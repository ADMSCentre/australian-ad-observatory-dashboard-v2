<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import type { CclSnapshot } from '$lib/types/ccl';

	interface Props {
		snapshot: CclSnapshot | null;
		onClose: () => void;
	}

	const { snapshot, onClose }: Props = $props();
	const snapshotData = $derived(snapshot?.data.snapshot);
	const firstCard = $derived(snapshotData?.cards?.[0]);

	function formatDate(epoch: number): string {
		if (!epoch) return 'N/A';
		return new Date(epoch * 1000).toLocaleDateString('en-GB', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<Sheet.Root
	open={true}
	onOpenChange={(open) => {
		if (!open) onClose();
	}}
>
	<Sheet.Content class="min-w-[100vw] overflow-y-scroll sm:min-w-[50vw] sm:max-w-3xl">
		<Sheet.Header>
			<Sheet.Title>{snapshotData?.title || firstCard?.title || 'Ad Snapshot'}</Sheet.Title>
			<Sheet.Description>
				{snapshot?.data?.page_name} &middot;
				{formatDate(snapshot?.data?.start_date ?? 0)} — {formatDate(snapshot?.data?.end_date ?? 0)}
			</Sheet.Description>
		</Sheet.Header>

		<Tabs.Root value="preview">
			<Tabs.List>
				<Tabs.Trigger value="preview">Preview</Tabs.Trigger>
				<Tabs.Trigger value="content">Content</Tabs.Trigger>
				<Tabs.Trigger value="raw">JSON</Tabs.Trigger>
			</Tabs.List>

			<!-- Preview Tab - Show cards and images -->
			<Tabs.Content value="preview">
				<div class="space-y-4 py-4">
					<!-- Status badges -->
					<div class="flex flex-wrap items-center gap-2">
						{#if snapshot?.data?.is_active}
							<Badge
								variant="outline"
								class="border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-300"
							>
								Active
							</Badge>
						{:else}
							<Badge variant="secondary">Inactive</Badge>
						{/if}
						{#if snapshot?.data?.publisher_platform}
							{#each snapshot?.data?.publisher_platform ?? [] as platform}
								<Badge variant="secondary">{platform}</Badge>
							{/each}
						{/if}
						{#if snapshot?.data?.categories}
							{#each snapshot?.data?.categories ?? [] as category}
								<Badge variant="outline">{category}</Badge>
							{/each}
						{/if}
					</div>

					<!-- Cards -->
					{#each snapshotData?.cards ?? [] as card, idx}
						<div class="space-y-3 rounded-lg border p-4">
							<h4 class="font-semibold">{card.title || 'Card ' + (idx + 1)}</h4>

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

							{#if card.body}
								<p class="whitespace-pre-wrap text-sm text-muted-foreground">{card.body}</p>
							{/if}

							{#if card.caption}
								<p class="text-xs italic text-muted-foreground">{card.caption}</p>
							{/if}

							{#if card.cta_text}
								<div
									class="w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground"
								>
									{card.cta_text}
								</div>
							{/if}

							{#if card.link_url}
								<p class="truncate text-xs text-muted-foreground">
									<span class="font-medium">Link:</span>
									{card.link_url}
								</p>
							{/if}
						</div>
					{/each}

					<!-- Extra images -->
					{#if (snapshotData?.images?.length ?? 0) > 0}
						<div>
							<h4 class="mb-3 font-semibold">Images</h4>
							<div class="grid grid-cols-2 gap-3">
								{#each snapshotData?.images ?? [] as img}
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
					{#if (snapshotData?.extra_images?.length ?? 0) > 0}
						<div>
							<h4 class="mb-3 font-semibold">Additional Images</h4>
							<div class="grid grid-cols-2 gap-3">
								{#each snapshotData?.extra_images ?? [] as img}
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
				</div>
			</Tabs.Content>

			<!-- Content Tab - Structured metadata view -->
			<Tabs.Content value="content">
				<div class="max-h-[70vh] space-y-3 overflow-y-auto py-4">
					<div class="border-b pb-3">
						<p class="text-xs font-semibold uppercase text-muted-foreground">Page Name</p>
						<p class="text-sm">{snapshotData?.page_name}</p>
					</div>

					<div class="border-b pb-3">
						<p class="text-xs font-semibold uppercase text-muted-foreground">Title</p>
						<p class="text-sm">{snapshotData?.title || 'N/A'}</p>
					</div>

					<div class="border-b pb-3">
						<p class="text-xs font-semibold uppercase text-muted-foreground">Body</p>
						<p class="whitespace-pre-wrap text-sm">{snapshotData?.body?.text || 'N/A'}</p>
					</div>

					<div class="border-b pb-3">
						<p class="text-xs font-semibold uppercase text-muted-foreground">CTA</p>
						<p class="text-sm">{snapshotData?.cta_text || 'N/A'}</p>
					</div>

					{#if snapshotData?.link_url}
						<div class="border-b pb-3">
							<p class="text-xs font-semibold uppercase text-muted-foreground">Link URL</p>
							<p class="break-all text-sm">{snapshotData?.link_url}</p>
						</div>
					{/if}

					<div class="grid grid-cols-2 gap-4 border-b pb-3">
						<div>
							<p class="text-xs font-semibold uppercase text-muted-foreground">Start Date</p>
							<p class="text-sm">{formatDate(snapshot?.data?.start_date ?? 0)}</p>
						</div>
						<div>
							<p class="text-xs font-semibold uppercase text-muted-foreground">End Date</p>
							<p class="text-sm">{formatDate(snapshot?.data?.end_date ?? 0)}</p>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4 border-b pb-3">
						<div>
							<p class="text-xs font-semibold uppercase text-muted-foreground">Active</p>
							<p class="text-sm">{snapshot?.data?.is_active ? 'Yes' : 'No'}</p>
						</div>
						<div>
							<p class="text-xs font-semibold uppercase text-muted-foreground">Display Format</p>
							<p class="text-sm">{snapshotData?.display_format || 'N/A'}</p>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4 border-b pb-3">
						<div>
							<p class="text-xs font-semibold uppercase text-muted-foreground">Page Likes</p>
							<p class="text-sm">{snapshotData?.page_like_count?.toLocaleString() ?? 'N/A'}</p>
						</div>
						<div>
							<p class="text-xs font-semibold uppercase text-muted-foreground">Collation Count</p>
							<p class="text-sm">{snapshot?.data?.collation_count?.toLocaleString() ?? 'N/A'}</p>
						</div>
					</div>

					{#if snapshot?.data?.impressions_with_index?.impressions_text}
						<div class="border-b pb-3">
							<p class="text-xs font-semibold uppercase text-muted-foreground">Impressions</p>
							<p class="text-sm">{snapshot?.data?.impressions_with_index?.impressions_text}</p>
						</div>
					{/if}

					{#if snapshot?.data?.spend}
						<div class="border-b pb-3">
							<p class="text-xs font-semibold uppercase text-muted-foreground">Spend</p>
							<p class="text-sm">
								{snapshot?.data?.spend}
								{snapshot?.data?.currency}
							</p>
						</div>
					{/if}

					{#if snapshot?.data?.reach_estimate}
						<div class="border-b pb-3">
							<p class="text-xs font-semibold uppercase text-muted-foreground">Reach Estimate</p>
							<p class="text-sm">{snapshot?.data?.reach_estimate}</p>
						</div>
					{/if}

					{#if (snapshot?.data?.targeted_or_reached_countries?.length ?? 0) > 0}
						<div class="border-b pb-3">
							<p class="text-xs font-semibold uppercase text-muted-foreground">
								Targeted Countries
							</p>
							<p class="text-sm">{snapshot?.data?.targeted_or_reached_countries?.join(', ')}</p>
						</div>
					{/if}

					{#if (snapshotData?.page_categories?.length ?? 0) > 0}
						<div class="border-b pb-3">
							<p class="text-xs font-semibold uppercase text-muted-foreground">Page Categories</p>
							<div class="flex flex-wrap gap-1">
								{#each snapshotData?.page_categories ?? [] as cat}
									<Badge variant="secondary" class="text-xs">{cat}</Badge>
								{/each}
							</div>
						</div>
					{/if}

					{#if (snapshotData?.extra_texts?.length ?? 0) > 0}
						<div class="border-b pb-3">
							<p class="text-xs font-semibold uppercase text-muted-foreground">Extra Text Fields</p>
							<ul class="space-y-1 text-sm">
								{#each (snapshotData?.extra_texts ?? []).slice(0, 10) as text}
									<li class="text-muted-foreground">{text.text}</li>
								{/each}
								{#if (snapshotData?.extra_texts?.length ?? 0) > 10}
									<li class="italic text-muted-foreground">
										... and {(snapshotData?.extra_texts?.length ?? 0) - 10} more
									</li>
								{/if}
							</ul>
						</div>
					{/if}

					<div class="space-y-1 text-sm text-muted-foreground">
						<p><span class="font-medium">Page ID:</span> {snapshotData?.page_id}</p>
						<p><span class="font-medium">Ad Archive ID:</span> {snapshot?.data?.ad_archive_id}</p>
						<p><span class="font-medium">Collation ID:</span> {snapshot?.data?.collation_id}</p>
						<p><span class="font-medium">Source ID:</span> {snapshot?.source_id}</p>
					</div>
				</div>
			</Tabs.Content>

			<!-- Raw JSON Tab -->
			<Tabs.Content value="raw">
				<pre
					class="mt-4 max-h-[70vh] overflow-auto rounded-md bg-muted p-4 text-xs">{JSON.stringify(
						snapshot,
						null,
						2
					)}</pre>
			</Tabs.Content>
		</Tabs.Root>
	</Sheet.Content>
</Sheet.Root>
