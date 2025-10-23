<script lang="ts">
	import type { RichAdData } from '$lib/api/session/ads/types';
	import { onMount } from 'svelte';
	import { hiddenAdsManager } from './hidden-ads.svelte';
	import { toast } from 'svelte-sonner';
	import { asRichAds } from '$lib/api/session/ads/ads-index';
	import AdCardBody from 'mobile-observations/components/ad-card/ad-card-body.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Input } from '$lib/components/ui/input';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import {
		EyeOff,
		RotateCcw,
		Trash2,
		User,
		Clock,
		Eye,
		ChevronsLeft,
		ChevronsRight,
		LoaderCircle
	} from 'lucide-svelte';
	import { flip } from 'svelte/animate';
	import parseActivationCode from '$lib/utils/parse-activation-code';

	let ads: RichAdData[] = $state([]);
	let loading = $state(true);
	let currentPage = $state(1);
	let jumpToPageInput = $state('');
	let deleteDialogOpen = $state(false);
	let showIgnored = $state(false);
	let itemToDelete: { ad: (typeof hiddenAdsManager.items.hidden)[0]; index: number } | null =
		$state(null);

	// Helper to generate page numbers to display
	function getPageNumbers(current: number, total: number): (number | string)[] {
		if (total <= 7) {
			return Array.from({ length: total }, (_, i) => i + 1);
		}

		const pages: (number | string)[] = [1];

		if (current > 3) {
			pages.push('...');
		}

		const start = Math.max(2, current - 1);
		const end = Math.min(total - 1, current + 1);

		for (let i = start; i <= end; i++) {
			pages.push(i);
		}

		if (current < total - 2) {
			pages.push('...');
		}

		pages.push(total);

		return pages;
	}

	function handleJumpToPage() {
		const pageNum = parseInt(jumpToPageInput, 10);
		if (
			!isNaN(pageNum) &&
			pageNum >= 1 &&
			hiddenAdsManager.pagination &&
			pageNum <= hiddenAdsManager.pagination.totalPages
		) {
			goToPage(pageNum);
			jumpToPageInput = '';
		} else {
			toast.error(
				`Please enter a valid page number between 1 and ${hiddenAdsManager.pagination?.totalPages || 1}`
			);
		}
	}

	function handleJumpInputKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			handleJumpToPage();
		}
	}

	async function handleShowIgnoredChange(checked: boolean) {
		showIgnored = checked;
		// Reset to page 1 when toggling the filter
		await goToPage(1);
	}

	onMount(async () => {
		await goToPage(1);
	});

	async function goToPage(page: number) {
		loading = true;
		await hiddenAdsManager.fetch({
			page,
			pageSize: 50,
			include: showIgnored ? 'ignored' : 'not_ignored'
		});
		ads = asRichAds(
			hiddenAdsManager.items.hidden.map((i) => ({
				observer: i.observerId,
				timestamp: i.timestamp,
				adId: i.observationId
			}))
		);
		currentPage = page;
		loading = false;
	}

	// Whenever the number of ads reach 0, fetch the page again
	$effect(() => {
		if (
			!loading &&
			ads.length === 0 &&
			hiddenAdsManager.pagination &&
			hiddenAdsManager.pagination.totalPages > 0
		) {
			goToPage(currentPage);
		}
	});

	async function handleIgnore(hiddenAd: (typeof hiddenAdsManager.items.hidden)[0], index: number) {
		try {
			await hiddenAd.toggleIgnore(!hiddenAd.ignored);
			ads = ads.filter((_, i) => i !== index);
			toast.success('Hidden ad ignored successfully.');
		} catch (error) {
			toast.error('Failed to ignore hidden ad.');
			console.error(error);
		}
	}

	async function handleRestore(hiddenAd: (typeof hiddenAdsManager.items.hidden)[0], index: number) {
		try {
			await hiddenAd.restore();
			ads = ads.filter((_, i) => i !== index);
			toast.success('Ad restored successfully.');
		} catch (error) {
			toast.error('Failed to restore ad.');
			console.error(error);
		}
	}

	async function handleDelete(hiddenAd: (typeof hiddenAdsManager.items.hidden)[0], index: number) {
		// Open confirmation dialog instead of deleting immediately
		itemToDelete = { ad: hiddenAd, index };
		deleteDialogOpen = true;
	}

	async function confirmDelete() {
		if (!itemToDelete) return;

		const { ad, index } = itemToDelete;

		try {
			await ad.delete();
			ads = ads.filter((_, i) => i !== index);
			toast.success('Ad deleted permanently.');
		} catch (error) {
			toast.error('Failed to delete ad.');
			console.error(error);
		} finally {
			deleteDialogOpen = false;
			itemToDelete = null;
		}
	}

	function formatDate(timestamp: number): string {
		return new Date(timestamp * 1000).toLocaleString('en-AU', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="container mx-auto max-w-7xl space-y-6 p-6 pb-32">
	<div class="space-y-2">
		<h1 class="text-3xl font-bold tracking-tight">Hidden Ads Review</h1>
		<p class="text-muted-foreground">
			Review and manage ads that have been hidden. You can restore, ignore, or permanently delete
			these ads.
		</p>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-lg text-muted-foreground">Loading hidden ads...</div>
		</div>
	{:else if hiddenAdsManager.items.hidden.length === 0}
		<Card.Root>
			<Card.Content class="flex flex-col items-center justify-center py-12">
				<EyeOff class="mb-4 h-12 w-12 text-muted-foreground" />
				<p class="text-lg text-muted-foreground">No hidden ads found</p>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="flex flex-wrap items-center gap-4">
			{#each hiddenAdsManager.items.hidden as hiddenAd, index (hiddenAd.observationId)}
				<div animate:flip={{ duration: 300 }}>
					<Card.Root>
						<Card.Content class="p-6">
							<div class="grid gap-6 md:grid-cols-[auto_1fr]">
								<!-- Ad Preview -->
								<div class="flex items-start justify-center">
									<div class="h-64 w-48">
										<AdCardBody
											class="h-64"
											adData={ads[index]}
											include={{ tags: false, attributes: false }}
										/>
									</div>
								</div>
								<!-- Ad Information and Actions -->
								<div class="space-y-4">
									<div class="space-y-3">
										<div class="flex items-start gap-2">
											<span class="text-sm font-medium text-muted-foreground"> Observer: </span>
											<span class="font-mono text-sm"
												>{parseActivationCode(hiddenAd.observationId)}</span
											>
										</div>
										<div class="flex items-start gap-2">
											<span class="text-sm font-medium text-muted-foreground"> ID: </span>
											<span class="font-mono text-sm">{hiddenAd.observationId}</span>
										</div>
										<div class="flex items-start gap-2">
											<Clock class="mt-0.5 h-4 w-4 text-muted-foreground" />
											<span class="text-sm font-medium text-muted-foreground"> Hidden at: </span>
											<span class="text-sm">{formatDate(hiddenAd.hiddenAt)}</span>
										</div>
										<div class="flex items-start gap-2">
											<User class="mt-0.5 h-4 w-4 text-muted-foreground" />
											<div class="text-sm">
												<div class="font-medium">
													<span class="text-sm font-medium text-muted-foreground"> By: </span>
													{hiddenAd.hiddenBy.fullname}
												</div>
												<div class="font-mono text-xs text-muted-foreground">
													{hiddenAd.hiddenBy.userId}
												</div>
											</div>
										</div>
									</div>
									<!-- Action Buttons -->
									<div class="border-t pt-4">
										<div class="flex flex-wrap gap-2">
											<Tooltip.Root>
												<Tooltip.Trigger>
													<Button
														variant="outline"
														size="sm"
														onclick={() => handleIgnore(hiddenAd, index)}
														disabled={hiddenAd.loading.toggleIgnore}
													>
														{#if hiddenAd.loading.toggleIgnore}
															<LoaderCircle class="h-4 w-4 animate-spin" />
														{:else if hiddenAd.ignored}
															<Eye class="h-4 w-4" />
															Unignore
														{:else}
															<EyeOff class="h-4 w-4" />
															Ignore
														{/if}
													</Button>
												</Tooltip.Trigger>
												<Tooltip.Content>
													{#if hiddenAd.ignored}
														<p>Show this ad in the review list again</p>
													{:else}
														<p>Keep hidden but don't show in this review list</p>
													{/if}
												</Tooltip.Content>
											</Tooltip.Root>
											<Tooltip.Root>
												<Tooltip.Trigger>
													<Button
														variant="secondary"
														size="sm"
														onclick={() => handleRestore(hiddenAd, index)}
														disabled={hiddenAd.loading.restore}
													>
														{#if hiddenAd.loading.restore}
															<LoaderCircle class="h-4 w-4 animate-spin" />
														{:else}
															<RotateCcw class="h-4 w-4" />
															Restore
														{/if}
													</Button>
												</Tooltip.Trigger>
												<Tooltip.Content>
													<p>Make this ad visible again</p>
												</Tooltip.Content>
											</Tooltip.Root>
											<Tooltip.Root>
												<Tooltip.Trigger>
													<Button
														variant="destructive"
														size="sm"
														onclick={() => handleDelete(hiddenAd, index)}
														disabled={hiddenAd.loading.delete}
													>
														{#if hiddenAd.loading.delete}
															<LoaderCircle class="h-4 w-4 animate-spin" />
														{:else}
															<Trash2 class="h-4 w-4" />
															Delete
														{/if}
													</Button>
												</Tooltip.Trigger>
												<Tooltip.Content>
													<p>Permanently remove this ad (irreversible)</p>
												</Tooltip.Content>
											</Tooltip.Root>
										</div>
									</div>
								</div>
							</div>
						</Card.Content>
					</Card.Root>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Delete Confirmation Dialog -->
<Dialog.Root bind:open={deleteDialogOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Delete Ad Permanently</Dialog.Title>
			<Dialog.Description>
				{`Are you sure you want to permanently delete this ad? This action is irreversible and the ad cannot be recovered.`}
			</Dialog.Description>
		</Dialog.Header>
		<div class="space-y-4 py-4">
			{#if itemToDelete}
				<AdCardBody
					class="h-96"
					adData={ads[itemToDelete.index]}
					include={{ tags: false, attributes: false }}
				/>
				<div class="space-y-2">
					<div class="flex items-start gap-2">
						<span class="text-sm font-medium text-muted-foreground">Observer ID:</span>
						<span class="font-mono text-sm">{itemToDelete.ad.observerId}</span>
					</div>
					<div class="flex items-start gap-2">
						<span class="text-sm font-medium text-muted-foreground">Observation ID:</span>
						<span class="font-mono text-sm">{itemToDelete.ad.observationId}</span>
					</div>
				</div>
			{/if}
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (deleteDialogOpen = false)}>Cancel</Button>
			<Button variant="destructive" onclick={confirmDelete}>
				<Trash2 class="h-4 w-4" />
				Delete Permanently
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Fixed Pagination at Bottom -->
{#if hiddenAdsManager.pagination}
	<div
		class="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
	>
		<div class="container mx-auto max-w-7xl p-4">
			<div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<!-- Left Section: Page Info and Show Ignored Checkbox -->
				<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
					<div class="text-sm text-muted-foreground">
						Page {hiddenAdsManager.pagination.page} of {hiddenAdsManager.pagination.totalPages}
						<span class="hidden sm:inline">
							({hiddenAdsManager.pagination.totalRecords} total)
						</span>
					</div>

					<!-- Show Ignored Checkbox -->
					<div class="flex items-center gap-2">
						<Checkbox
							id="show-ignored"
							checked={showIgnored}
							onCheckedChange={handleShowIgnoredChange}
						/>
						<label
							for="show-ignored"
							class="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							Show ignored ads
						</label>
					</div>
				</div>

				<!-- Center Section: Jump to Page Input -->
				<div class="flex items-center gap-2">
					<span class="text-sm text-muted-foreground">Go to:</span>
					<Input
						type="number"
						bind:value={jumpToPageInput}
						onkeydown={handleJumpInputKeydown}
						placeholder="Page"
						min="1"
						max={hiddenAdsManager.pagination.totalPages}
						class="h-9 w-20"
					/>
					<Button variant="secondary" size="sm" onclick={handleJumpToPage} class="h-9">Go</Button>
				</div>

				<!-- Right Section: Pagination Controls -->
				<div class="flex flex-wrap items-center justify-center gap-1">
					<!-- Previous Page -->
					<Button
						variant="outline"
						size="sm"
						disabled={currentPage <= 1}
						onclick={() => goToPage(currentPage - 1)}
						class="hidden sm:flex"
					>
						Previous
					</Button>

					<!-- Page Numbers -->
					{#each getPageNumbers(currentPage, hiddenAdsManager.pagination.totalPages) as page}
						{#if page === '...'}
							<span class="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground">
								…
							</span>
						{:else}
							<Button
								variant={currentPage === page ? 'default' : 'outline'}
								size="sm"
								onclick={() => {
									if (typeof page === 'number') goToPage(page);
								}}
								class="h-9 w-9 p-0"
							>
								{page}
							</Button>
						{/if}
					{/each}

					<!-- Next Page -->
					<Button
						variant="outline"
						size="sm"
						disabled={currentPage >= hiddenAdsManager.pagination.totalPages}
						onclick={() => goToPage(currentPage + 1)}
						class="hidden sm:flex"
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	</div>
{/if}
