<script lang="ts">
	import type { DateRange } from 'bits-ui';
	import type { BasicAdData, ExpandType, RichAdData } from '$lib/api/session/ads/types';
	import AdCard, { type Props as AdCardProps, type AdElement } from './ad-card/ad-card.svelte';
	import { dateToCalendarDate } from '../../../lib/api/session/ads/utils';
	import Accordion from '$lib/components/accordion/accordion.svelte';
	import { ChevronRight, FilterIcon, LoaderCircleIcon, SearchIcon } from 'lucide-svelte';
	import { twMerge } from 'tailwind-merge';
	import { slide } from 'svelte/transition';
	import AdRichView from './rich-view/ad-rich-view.svelte';
	import { WindowVirtualizer } from 'virtua/svelte';
	import { onMount, untrack } from 'svelte';
	import { flip } from 'svelte/animate';
	import Dropdown from '$lib/components/dropdown/dropdown.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { page } from '$app/stores';
	import { replaceState } from '$app/navigation';
	import { session } from '$lib/api/session/session.svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as HoverCard from '$lib/components/ui/hover-card';
	import ProgressCircle from '$lib/components/progress-circle.svelte';

	type Props = {
		ads: RichAdData[];
		dateRange?: DateRange;
		open?: boolean | 'first' | 'last';
		cardOptions?: Omit<AdCardProps, 'adData'>;
		filters?: ((ad: RichAdData) => boolean)[];
		richViewExpanded?: boolean;
		syncQueryParams?: boolean;
		enableAttributeFilter?: boolean;
		params?: {
			search?: string;
			sort?: string;
			group?: string;
			attributes?: {
				[attribute: string]: string;
			};
		};
		virtualised?: boolean; // Whether to use windowing for the ad list (recommended for >100 ads)
	};

	let {
		// The `ads` prop is bindable, so parent components can control selection/expansion
		ads = $bindable(),
		dateRange,
		open,
		cardOptions = {
			exclude: []
		},
		params = {},
		filters = [],
		richViewExpanded = $bindable(false),
		syncQueryParams = true,
		enableAttributeFilter: attributeFilter = true,
		virtualised = true
	}: Props = $props();

	const defaultSearchKey = params.search || $page.url.searchParams.get('search') || '';
	const sortParam = params.sort || $page.url.searchParams.get('sort') || '';
	const groupParam = params.group || $page.url.searchParams.get('group') || 'date';

	// For expanded (rich) view
	let currentAd = $state<RichAdData | null>(null);

	// Enrich the ads with attributes
	let loading = $state(false);
	// Mapping from adId -> Set of classification labels for quick membership checks
	let adClassificationsCache = $state<Map<string, Set<string>>>(new Map());
	// Set of unique classification labels across all ads (used to populate the filter UI)
	let uniqueClassificationLabels = $state<Set<string>>(new Set());

	let progress = $state<{
		completed: number;
		total: number;
	}>({ completed: 0, total: 0 });

	const allowAttributesFilter = $derived(ads.length > 0 && attributeFilter);

	// Grouping and sorting configuration
	const groups = [
		{
			value: 'date',
			label: 'Date',
			getKey: (ad: RichAdData) => {
				const date = new Date(ad.timestamp);
				return date.toLocaleDateString('en-GB', {
					weekday: 'long',
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				});
			}
		},
		{
			value: 'week',
			label: 'Week',
			getKey: (ad: RichAdData) => {
				const date = new Date(ad.timestamp);
				const weekStart = new Date(
					date.getFullYear(),
					date.getMonth(),
					date.getDate() - date.getDay() + 1
				);
				const weekEnd = new Date(weekStart);
				weekEnd.setDate(weekStart.getDate() + 6);
				const dateStrOptions: Intl.DateTimeFormatOptions = {
					weekday: 'short',
					month: 'short',
					day: 'numeric',
					year: 'numeric'
				};
				return `${weekStart.toLocaleString('en-GB', dateStrOptions)} - ${weekEnd.toLocaleString('en-GB', dateStrOptions)}`;
			}
		},
		{
			value: 'month',
			label: 'Month',
			getKey: (ad: RichAdData) => {
				const date = new Date(ad.timestamp);
				return date.toLocaleString('default', { month: 'long', year: 'numeric' });
			}
		},
		{
			value: 'none',
			label: 'None',
			getKey: (ad: RichAdData) => 'All'
		}
	];
	const sortOptions = [
		{
			value: 'newest',
			label: 'Newest',
			sort: (a: BasicAdData, b: BasicAdData) => b.timestamp - a.timestamp
		},
		{
			value: 'oldest',
			label: 'Oldest',
			sort: (a: BasicAdData, b: BasicAdData) => a.timestamp - b.timestamp
		},
		{
			value: 'default',
			label: 'Default',
			sort: (a: BasicAdData, b: BasicAdData) => 0
		}
	];
	const attributeFilterOptions: {
		attribute: string;
		label: string;
		value: string | boolean | undefined;
		mode: 'single' | 'multiple';
		options: Record<
			string,
			{
				label: string;
				filter: (value: string | boolean | undefined) => boolean;
			}
		>;
	}[] = [
		{
			attribute: 'hidden',
			label: 'Hidden',
			value: params.attributes?.hidden || 'false',
			mode: 'single',
			options: {
				all: {
					label: 'All',
					filter: () => true
				},
				true: {
					label: 'True',
					filter: (value) => {
						if (value === undefined) return false;
						if (typeof value === 'boolean') return value;
						return value.toLowerCase() === 'true';
					}
				},
				false: {
					label: 'False',
					filter: (value) => {
						if (value === undefined) return true;
						if (typeof value === 'boolean') return !value;
						return value.toLowerCase() === 'false';
					}
				}
			}
		},
		{
			attribute: 'starred',
			label: 'Starred',
			value: params.attributes?.starred || 'all',
			mode: 'single',
			options: {
				all: {
					label: 'All',
					filter: () => true
				},
				true: {
					label: 'True',
					filter: (value) => {
						if (value === undefined) return false;
						if (typeof value === 'boolean') return value;
						return value.toLowerCase() === 'true';
					}
				},
				false: {
					label: 'False',
					filter: (value) => {
						if (value === undefined) return true;
						if (typeof value === 'boolean') return !value;
						return value.toLowerCase() === 'false';
					}
				}
			}
		}
	];

	let groupBy = $state(groups.find((g) => g.value === groupParam) || groups[0]);
	let sortBy = $state(sortOptions.find((s) => s.value === sortParam) || sortOptions[0]);
	let attributeFilters = $state(attributeFilterOptions);
	let searchKey = $state(defaultSearchKey);
	let selectedTagIds = $state<(string | null)[]>([]);
	const selectedTagIdSet = $derived(new Set(selectedTagIds));

	let selectedClassifications = $state<string[]>(['Unclassified']);
	const selectedClassificationsSet = $derived(new Set(selectedClassifications));

	/**
	 * onMount: kick off fetching of enrichment data (tags, classifications) and build
	 * caches used by the UI filtering and the classification dropdown.
	 */
	onMount(async () => {
		loading = true;
		// Optimised for smooth progress updates and avoid blocking so user can do other things
		const BATCH_SIZE = 500;
		progress.total = Math.ceil(ads.length / BATCH_SIZE) + 5;

		await session.tags.fetch();

		const enrichBatch = async (types: ExpandType[]) => {
			const batches = [];
			for (let i = 0; i < ads.length; i += BATCH_SIZE) {
				batches.push(ads.slice(i, i + BATCH_SIZE));
			}
			for (const [index, batch] of batches.entries()) {
				await session.ads.getEnrichedData(batch, types, {
					updateMemoryCache: true
				});
				await Promise.all(batch.map((ad) => session.ads.enrich(ad, types)));
				progress.completed += 1;
			}
		};

		const targetTypes: ExpandType[] = ['tags', 'classifications'];
		if (allowAttributesFilter) targetTypes.push('attributes');
		await enrichBatch(targetTypes);

		// Cache classification labels per-ad and populate UI set
		ads.forEach((ad) => {
			let labels = adClassificationsCache.get(ad.adId);
			if (!labels) {
				labels = new Set<string>();
				ad.classifications?.forEach((c) => labels!.add(c.label));
				adClassificationsCache.set(ad.adId, labels);
			}
			labels.forEach((label) => uniqueClassificationLabels.add(label));
		});
		progress.completed += 5;
		loading = false;
	});

	// NOTE: uniqueClassificationLabels is populated after enrichment finishes (in onMount). We use it to populate the UI.

	$effect(() => {
		// If tags are available, default to selecting all tags so that the filter initially shows all results
		if (session.tags.loading) return;
		untrack(() => {
			if (selectedTagIds.length === 0) {
				selectedTagIds = [...session.tags.all.map((t) => t.id), null];
			}
		});
	});

	$effect(() => {
		// Auto-select all classifications by default once classification labels are cached
		if (loading) return;
		if (uniqueClassificationLabels.size === 0) return;
		untrack(() => {
			const classifications = Array.from(uniqueClassificationLabels);
			// Select all classifications by default if the only one currently selected is "Unclassified" (which is the default state before enrichment)
			if (selectedClassifications.length === 1 && selectedClassifications[0] === 'Unclassified') {
				selectedClassifications = [...classifications, 'Unclassified'];
			}
		});
	});

	const debounce = (fn: Function, delay: number) => {
		let timeout: NodeJS.Timeout;
		return (...args: any[]) => {
			clearTimeout(timeout);
			timeout = setTimeout(() => fn(...args), delay);
		};
	};
	// Debounced input handler for search: updates URL query params when `syncQueryParams` is enabled
	// Uses `replaceState` to avoid adding browser history entries while typing
	const searchDebounce = debounce((value: string) => {
		searchKey = value;
		if (!syncQueryParams) return;
		if (searchKey.length > 0) $page.url.searchParams.set('search', searchKey);
		else $page.url.searchParams.delete('search');
		replaceState($page.url, $page.state);
	}, 300);

	/*
		groupedAds pipeline:
		1) Apply date range / attribute filters
		2) Filter by tag selections
		3) Filter by classification selection (uses cached sets to avoid O(n*m) scans)
		4) Apply any additional custom filters provided via props
		5) Sort and group the final array
		Note: while loading we skip filtering to avoid hiding results until enrichment completes.
	*/
	const groupedAds = $derived.by(() => {
		const searchFilter = (ad: RichAdData) => {
			if (!searchKey) return true;
			return (
				ad.adId.toLowerCase().includes(searchKey.toLowerCase()) ||
				ad.observer.toLowerCase().includes(searchKey.toLowerCase())
			);
		};

		const filteredAds = loading
			? ads
			: ads
					// 1) Filter by supplied date range
					.filter((ad) => {
						if (!dateRange) return true; // No range -> show all ads
						if (!dateRange.start || !dateRange.end) return false;
						const date = new Date(ad.timestamp);
						const calendarDate = dateToCalendarDate(date);
						return calendarDate >= dateRange.start && calendarDate <= dateRange.end;
					})
					// Filter by attribute filters
					.filter((ad) => {
						const attrs: {
							[key: string]: {
								value?: string;
							};
						} = ad.attributes || {};
						return attributeFilters.every((filter) => {
							const attr = attrs[filter.attribute]?.value;
							const selectedOption = filter.options[filter.value as string];
							return selectedOption?.filter(attr) || false;
						});
					})
					// Filter by tags
					.filter((ad) => {
						// If the tag ids are invalid, remove them
						const validAppliedTags =
							ad.tags?.filter((tagId) => session.tags.getById(tagId) !== undefined) || [];
						// Ad has no tags and "No tag" is selected
						if (validAppliedTags.length === 0 && selectedTagIdSet.has(null)) return true;
						return validAppliedTags.some((tagId) => selectedTagIdSet.has(tagId)) || false;
					})
					// Filter by classifications
					.filter((ad) => {
						// Membership check using cached sets
						const adClassifications = adClassificationsCache.get(ad.adId);
						if (!adClassifications || adClassifications.size === 0)
							return selectedClassificationsSet.has('Unclassified');
						for (const label of selectedClassificationsSet) {
							if (adClassifications.has(label)) return true;
						}
						return false;
					})
					// Filter by other filters
					.filter((ad) => filters.every((filter) => filter(ad)));

		const sortedAds = filteredAds.toSorted(sortBy.sort);
		const groupedAds = sortedAds.reduce(
			(
				acc: {
					[key: string]: BasicAdData[];
				},
				ad
			) => {
				const key = groupBy.getKey(ad);
				if (!acc[key]) acc[key] = [];
				// Attempt to filter here as we still want to keep the group
				if (!searchFilter(ad)) return acc;
				acc[key].push(ad);
				return acc;
			},
			{}
		);
		// Convert to entries, sort by date
		const adsEntries = Object.entries(groupedAds);
		// Filtered ${ads.length} ads to ${adsEntries.length} groups with ${filteredAds.length} ads
		return adsEntries;
	});

	// Small helper: find the index of an ad in the `ads` array by its adId
	const getAdIndex = (ad: RichAdData) => ads.findIndex((a) => a.adId === ad.adId);
	const onSingleAdExpand = (ad: RichAdData) => {
		currentAd = ad;
		richViewExpanded = true;
	};
	// Maximum number of ads in any group; used to compute scaled UI elements (e.g. group width bars)
	const maxAdsInGroup = $derived(Math.max(...(groupedAds?.map(([, ads]) => ads.length) || [])));

	let clientWidth = $state(0);
	const MAX_AD_WIDTH = 384; // px
	const PADDING = 40; // px

	let resizeTimeout = $state<NodeJS.Timeout | null>(null);
	// Number of ad cards to show per row, calculated from container width and target card width
	let cardsPerRow = $state(1);

	$effect(() => {
		clientWidth;
		untrack(() => {
			if (resizeTimeout) clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(() => {
				cardsPerRow = Math.floor(clientWidth / (MAX_AD_WIDTH - PADDING));
				if (cardsPerRow < 1) cardsPerRow = 1;
			}, 50);
		});
	});

	// Break a flat array of ads into groups of `cardsPerRow` for grid layout in each accordion
	const chunkAdsIntoRows = $derived((adData: BasicAdData[]) => {
		const groups = [];
		for (let i = 0; i < adData.length; i += cardsPerRow) {
			groups.push(adData.slice(i, i + cardsPerRow));
		}
		return groups;
	});

	// If group by date, do not include date
	const exclude = $derived.by<AdElement[]>(() => {
		const options = cardOptions.exclude || [];
		if (groupBy.value === 'date') return [...options, 'date'];
		return options;
	});
</script>

{#snippet adRow(item: RichAdData[])}
	<div class="flex w-full flex-col items-center">
		<div class="grid w-full gap-10" style={`grid-template-columns: repeat(${cardsPerRow}, 1fr)`}>
			{#each item as adData (adData.adId)}
				<div class="will-change-transform">
					<AdCard
						adData={ads[getAdIndex(adData)]}
						{exclude}
						onExpand={() => onSingleAdExpand(ads[getAdIndex(adData)])}
						class="grid w-full grid-rows-[auto_384px_auto]"
					/>
				</div>
			{/each}
		</div>
	</div>
{/snippet}

<div class="relative flex flex-col gap-4" bind:clientWidth>
	<!-- Controls (grouping, ordering) -->
	<div
		class="flex flex-col items-end gap-2 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4"
	>
		<div class="relative flex items-center gap-2">
			<HoverCard.Root>
				<HoverCard.Trigger class="no-underline">
					<Input
						placeholder="Search..."
						value={searchKey}
						oninput={(e) => {
							const target = e.target as HTMLInputElement;
							searchDebounce(target.value);
						}}
						class="pl-8"
					/>
					<SearchIcon class="absolute left-2 top-1/2 -translate-y-1/2 transform" size={20} />
				</HoverCard.Trigger>
				<HoverCard.Content class="w-fit max-w-sm">
					<h3 class="mb-2 text-base font-semibold">Search Ads</h3>
					<p class="text-sm text-muted-foreground">
						Search ads by Ad ID or Observer ID. The search is case-insensitive and matches any part
						of the ID.
					</p>
				</HoverCard.Content>
			</HoverCard.Root>

			<Popover.Root>
				<Popover.Trigger>
					<Button variant="outline" class="ml-2 flex items-center gap-2">
						{#if loading}
							{@const percent = Math.floor((progress.completed / progress.total) * 100)}

							<ProgressCircle size={16} {progress} />
							<span>
								Preparing filters...
								<span class="text-xs font-light text-foreground/75">
									{percent}%
								</span>
							</span>
						{:else}
							<FilterIcon size={16} />
							<span>Filters</span>
							<ChevronRight size={16} />
						{/if}
					</Button>
				</Popover.Trigger>
				<Popover.Content class="w-fit">
					<h2 class=" text-lg font-medium">Filters</h2>
					<p class=" text-sm text-muted-foreground">
						Narrow down the ads displayed with the filters below.
					</p>
					<div class="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 py-4">
						{#if allowAttributesFilter}
							{#each attributeFilterOptions as { label, value, attribute }}
								<div class="contents">
									<span>{label}</span>
									{#if loading}
										<LoaderCircleIcon class="animate-spin" size={16} />
									{:else}
										<Dropdown
											options={Object.entries(
												attributeFilterOptions.find((f) => f.attribute === attribute)?.options || {}
											).map(([key, option]) => ({
												value: key,
												label: option.label
											}))}
											triggerClass="w-full"
											contentClass="w-fit"
											disabled={loading}
											selected={value}
											onSelected={(option) => {
												const selectedOption = option as boolean | 'all';
												attributeFilters = attributeFilters.map((filter) =>
													filter.attribute === attribute
														? { ...filter, value: selectedOption }
														: filter
												);
												if (!syncQueryParams) return;
												if (selectedOption === 'all') $page.url.searchParams.delete(attribute);
												else $page.url.searchParams.set(attribute, selectedOption.toString());
												replaceState($page.url, $page.state);
											}}
										/>
									{/if}
								</div>
							{/each}
						{/if}

						<div class="contents">
							<span>Tags</span>
							{#if loading}
								<LoaderCircleIcon class="animate-spin" size={16} />
							{:else}
								<Dropdown
									mode="multiple"
									options={[
										...session.tags.all.map((t) => ({ value: t.id, label: t.name })),
										{ value: null, label: 'No tag' }
									]}
									triggerClass="w-full"
									disabled={session.tags.loading}
									bind:selected={selectedTagIds}
									clearable={true}
									searchable={true}
									allowSelectAll={true}
								/>
							{/if}
						</div>

						<div class="contents">
							<span>Classifications</span>
							{#if loading}
								<LoaderCircleIcon class="animate-spin" size={16} />
							{:else}
								<Dropdown
									mode="multiple"
									options={Array.from(uniqueClassificationLabels)
										.map((label) => ({
											value: label,
											label
										}))
										.concat({
											value: 'Unclassified',
											label: 'Unclassified'
										})}
									disabled={loading}
									triggerClass="w-full"
									bind:selected={selectedClassifications}
									clearable={true}
									searchable={true}
									allowSelectAll={true}
									placeholder="Filter by classification..."
								/>
							{/if}
						</div>
					</div></Popover.Content
				>
			</Popover.Root>
		</div>
		<div class="flex items-center gap-2">
			<div class="flex items-center gap-2">
				<p>Group by:</p>
				<Dropdown
					options={groups}
					selected={groupBy.value}
					triggerClass="w-fit"
					contentClass="w-fit"
					onSelected={(option: string) => {
						groupBy = groups.find((g) => g.value === option) || groups[0];
						// Update URL
						if (!syncQueryParams) return;
						$page.url.searchParams.set('group', groupBy.value);
						replaceState($page.url, $page.state);
					}}
				/>
			</div>
			<div class="flex items-center gap-2">
				<p>Sort by:</p>
				<Dropdown
					options={sortOptions}
					selected={sortBy.value}
					triggerClass="w-fit"
					contentClass="w-fit"
					onSelected={(option: string) => {
						sortBy = sortOptions.find((s) => s.value === option) || sortOptions[0];
						// Update URL
						if (!syncQueryParams) return;
						$page.url.searchParams.set('sort', sortBy.value);
						replaceState($page.url, $page.state);
					}}
				/>
			</div>
		</div>
	</div>

	{#if !groupedAds || groupedAds.length === 0}
		<div class="flex h-full w-full items-center justify-center">
			<p class="text-muted-foreground">
				There are {ads.length} ad{ads.length > 1 ? 's' : ''} in the sample, but none match the filters.
				Try changing the filters to see the ads.
			</p>
		</div>
	{:else}
		{#each groupedAds as [groupKey, adData], index (groupKey)}
			{@const rowData = chunkAdsIntoRows(adData)}
			{@const adCountBarWidth = (adData.length / maxAdsInGroup) * 100 + '%'}
			<div animate:flip={{ duration: 300 }}>
				<Accordion
					open={open === true ||
						(open === 'first' && index === 0) ||
						(open === 'last' && index === groupedAds.length - 1)}
					class="w-full"
				>
					{#snippet summary(open)}
						<div
							class="sticky top-0 z-10 flex w-full cursor-pointer items-center gap-2 border-b bg-background bg-opacity-50 px-2 py-1.5 text-left font-medium backdrop-blur-sm"
						>
							<ChevronRight
								class={twMerge('size-4 transition', open ? 'rotate-90 transform' : '')}
							/>
							{groupKey} ({adData.length} ad{adData.length > 1 ? 's' : ''})
							<!-- Ad count bar background -->
							<div
								class="absolute left-0 top-0 h-full bg-gradient-to-r from-foreground/25 to-transparent"
								style={`width: ${adCountBarWidth}`}
							></div>
						</div>
					{/snippet}

					<div transition:slide class={twMerge(adData.length > 0 ? 'p-4' : '')}>
						{#if virtualised}
							<WindowVirtualizer data={rowData} overscan={3} itemSize={450}>
								{#snippet children(item, index)}
									{@render adRow(item)}
								{/snippet}
							</WindowVirtualizer>
						{:else}
							{#each rowData as item (item[0].adId)}
								{@render adRow(item)}
							{/each}
						{/if}
					</div>
				</Accordion>
			</div>
		{/each}
	{/if}
</div>

<AdRichView bind:richViewExpanded bind:currentAd />
