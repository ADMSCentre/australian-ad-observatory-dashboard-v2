<script lang="ts">
	import type { DateRange } from 'bits-ui';
	import type { BasicAdData, ExpandType, RichAdData } from '$lib/api/session/ads/types';
	import AdCard, { type Props as AdCardProps, type AdElement } from './ad-card/ad-card.svelte';
	import { dateToCalendarDate } from '../../../lib/api/session/ads/utils';
	import Accordion from '$lib/components/accordion/accordion.svelte';
	import {
		ChevronRight,
		Check,
		EyeOff,
		FilterIcon,
		LoaderCircleIcon,
		SearchIcon,
		Star
	} from 'lucide-svelte';
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
				description?: string;
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
				overlay: {
					label: 'Overlay',
					description: 'Hidden ads are replaced with an overlay and can be revealed at any time',
					filter: () => true
				},
				all: {
					label: 'Show',
					description: 'Hidden ads are shown normally with a "Hidden" badge',
					filter: () => true
				},
				false: {
					label: 'Hide',
					description: 'Hidden ads are not shown at all',
					filter: (value) => {
						if (value === undefined) return true;
						if (typeof value === 'boolean') return !value;
						return value.toLowerCase() === 'false';
					}
				},
				true: {
					label: 'Only hidden',
					description: 'Only hidden ads are shown',
					filter: (value) => {
						if (value === undefined) return false;
						if (typeof value === 'boolean') return value;
						return value.toLowerCase() === 'true';
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
	// Display mode for hidden ads, derived from the selected "hidden" filter option:
	// 'overlay' renders hidden ads as a click-to-reveal placeholder, 'normal' shows them with a badge
	const hiddenDisplayMode = $derived<'overlay' | 'normal'>(
		attributeFilters.find((f) => f.attribute === 'hidden')?.value === 'overlay'
			? 'overlay'
			: 'normal'
	);
	let searchKey = $state(defaultSearchKey);
	let selectedTagIds = $state<(string | null)[]>([]);
	const selectedTagIdSet = $derived(new Set(selectedTagIds));

	let selectedClassifications = $state<string[]>([]);
	const selectedClassificationsSet = $derived(new Set(selectedClassifications));

	type FilterTab = 'classifications' | 'tags';
	let filterSearchInput = $state('');
	let activeFilterTab = $state<FilterTab>('classifications');

	// Total available tag options (used to detect the "all selected" default state for tags)
	const allTagOptionCount = $derived(session.tags.all.length + 1); // +1 for "No tag"

	// Cached original number of classification options (including "Unclassified"). Captured once
	// enrichment completes so the "all selected" default threshold stays stable even if the live
	// label set changes later.
	let defaultClassificationCount = $state(0);

	// Whether each filter category is currently in its "no-filter" default state. Both the
	// "all selected" and "none selected" states count as default — an empty selection is treated
	// as "show all" so unselecting every option never hides everything. In the default state
	// checkboxes render unchecked, so checking a single option immediately narrows that category
	// down to just the selected option. Tags and classifications are tracked independently so
	// selecting one does not alter the other's state.
	const isTagDefault = $derived(
		selectedTagIds.length === 0 || selectedTagIds.length === allTagOptionCount
	);
	const isClassificationDefault = $derived(
		selectedClassifications.length === 0 ||
			selectedClassifications.length === defaultClassificationCount
	);

	// Number of ads per tag / classification label, used to render counts next to each option.
	const filterCounts = $derived.by(() => {
		const tagCounts = new Map<string | null, number>();
		const classCounts = new Map<string, number>();
		for (const ad of ads) {
			const validAppliedTags =
				ad.tags?.filter((tagId) => session.tags.getById(tagId) !== undefined) || [];
			if (validAppliedTags.length === 0) {
				tagCounts.set(null, (tagCounts.get(null) || 0) + 1);
			} else {
				for (const tagId of validAppliedTags) {
					tagCounts.set(tagId, (tagCounts.get(tagId) || 0) + 1);
				}
			}
			const labels = adClassificationsCache.get(ad.adId);
			if (!labels || labels.size === 0) {
				classCounts.set('Unclassified', (classCounts.get('Unclassified') || 0) + 1);
			} else {
				for (const label of labels) {
					classCounts.set(label, (classCounts.get(label) || 0) + 1);
				}
			}
		}
		return { tagCounts, classCounts };
	});

	// Tag options (including the synthetic "No tag" entry), filtered by the popover search input
	const filteredTagOptions = $derived.by(() => {
		const query = filterSearchInput.trim().toLowerCase();
		const options = [
			...session.tags.all.map((t) => ({ id: t.id as string | null, name: t.name, hex: t.hex })),
			{ id: null as string | null, name: 'No tag', hex: '#9ca3af' }
		];
		if (!query) return options;
		return options.filter((option) => option.name.toLowerCase().includes(query));
	});

	// Classification labels (including the synthetic "Unclassified" entry), filtered by the popover search input
	const filteredClassificationOptions = $derived.by(() => {
		const query = filterSearchInput.trim().toLowerCase();
		const labels = Array.from(new Set([...uniqueClassificationLabels, 'Unclassified']));
		if (!query) return labels;
		return labels.filter((label) => label.toLowerCase().includes(query));
	});

	const toggleTagFilter = (tagId: string | null) => {
		// From the default (all-selected) state, checking one option narrows to just that option.
		if (isTagDefault) {
			selectedTagIds = [tagId];
			return;
		}
		if (selectedTagIdSet.has(tagId)) {
			selectedTagIds = selectedTagIds.filter((id) => id !== tagId);
		} else {
			selectedTagIds = [...selectedTagIds, tagId];
		}
	};

	const toggleClassificationFilter = (label: string) => {
		if (isClassificationDefault) {
			selectedClassifications = [label];
			return;
		}
		if (selectedClassificationsSet.has(label)) {
			selectedClassifications = selectedClassifications.filter((l) => l !== label);
		} else {
			selectedClassifications = [...selectedClassifications, label];
		}
	};

	// A filter category counts as "active" when it deviates from its default (no-filter) state.
	// Since an empty selection is treated as "show all", only a partial selection is active — and
	// the count reflects the number of options the user has actively selected.
	const activeFilterCount = $derived.by(() => {
		let count = 0;
		for (const filter of attributeFilters) {
			if (filter.attribute === 'hidden' && filter.value !== 'false') count++;
			if (filter.attribute === 'starred' && filter.value !== 'all') count++;
		}
		if (!isTagDefault) {
			count += selectedTagIds.length;
		}
		if (!isClassificationDefault) {
			count += selectedClassifications.length;
		}
		return count;
	});
	const hasActiveFilters = $derived(activeFilterCount > 0);

	const clearAllFilters = () => {
		// Reset to empty (the no-filter "show all" state) for tags and classifications
		selectedTagIds = [];
		selectedClassifications = [];
		attributeFilters = attributeFilters.map((filter) => ({
			...filter,
			value: filter.attribute === 'hidden' ? 'false' : 'all'
		}));
		filterSearchInput = '';
	};

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
		// Cache the original (default) classification count once labels are available so the
		// "no-filter" default state can be detected reliably. An empty selection is treated as
		// "show all", so we no longer auto-select every classification on load.
		if (loading) return;
		if (uniqueClassificationLabels.size === 0) return;
		untrack(() => {
			const classifications = Array.from(uniqueClassificationLabels);
			defaultClassificationCount = classifications.length + 1; // +1 for "Unclassified"
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
						// Empty selection = no tag filter = show all
						if (selectedTagIdSet.size === 0) return true;
						// If the tag ids are invalid, remove them
						const validAppliedTags =
							ad.tags?.filter((tagId) => session.tags.getById(tagId) !== undefined) || [];
						// Ad has no tags and "No tag" is selected
						if (validAppliedTags.length === 0 && selectedTagIdSet.has(null)) return true;
						return validAppliedTags.some((tagId) => selectedTagIdSet.has(tagId)) || false;
					})
					// Filter by classifications
					.filter((ad) => {
						// Empty selection = no classification filter = show all
						if (selectedClassificationsSet.size === 0) return true;
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
	const MAX_AD_WIDTH = 288; // px
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
		<div class="grid w-full gap-4" style={`grid-template-columns: repeat(${cardsPerRow}, 1fr)`}>
			{#each item as adData (adData.adId)}
				<div class="will-change-transform">
					<AdCard
						adData={ads[getAdIndex(adData)]}
						{exclude}
						{hiddenDisplayMode}
						onExpand={() => onSingleAdExpand(ads[getAdIndex(adData)])}
						class="grid w-full grid-rows-[auto_384px_auto]"
					/>
				</div>
			{/each}
		</div>
	</div>
{/snippet}

{#snippet checkIcon()}
	<Check class="size-3" />
{/snippet}

<div class="relative flex flex-col gap-4 py-4" bind:clientWidth>
	<!-- Controls (grouping, ordering) -->
	<div class="flex flex-col gap-3 text-sm lg:flex-row lg:items-center lg:justify-between">
		<div class="relative flex flex-wrap items-center gap-2">
			<HoverCard.Root>
				<HoverCard.Trigger class="no-underline">
					<Input
						placeholder="Search..."
						value={searchKey}
						oninput={(e) => {
							const target = e.target as HTMLInputElement;
							searchDebounce(target.value);
						}}
						class="h-9 bg-background pl-9 text-sm"
					/>
					<SearchIcon
						class="absolute left-3 top-1/2 size-4 -translate-y-1/2 transform text-muted-foreground"
					/>
				</HoverCard.Trigger>
				<HoverCard.Content class="w-80 rounded-xl">
					<h3 class="mb-2 text-base font-semibold">Search ads</h3>
					<p class="text-sm leading-5 text-muted-foreground">
						Search ads by Ad ID or Observer ID. The search is case-insensitive and matches any part
						of the ID.
					</p>
				</HoverCard.Content>
			</HoverCard.Root>

			<Popover.Root>
				<Popover.Trigger>
					<Button variant="outline" class="h-9 gap-2">
						{#if loading}
							{@const percent = Math.floor((progress.completed / progress.total) * 100)}

							<ProgressCircle size={16} {progress} />
							<span>
								Preparing filters...
								<span class="font-mono text-xs tabular-nums text-foreground/75">
									{percent}%
								</span>
							</span>
						{:else}
							<FilterIcon class="size-4" />
							<span>Filters</span>
							{#if activeFilterCount > 0}
								<span class="rounded bg-primary px-1.5 text-[10px] text-primary-foreground">
									{activeFilterCount}
								</span>
							{/if}
						{/if}
					</Button>
				</Popover.Trigger>
				<Popover.Content class="w-80 p-0" align="end" sideOffset={4}>
					<div class="flex flex-col">
						<div class="flex items-center gap-2 border-b border-border px-3 py-2">
							<SearchIcon class="size-3.5 shrink-0 text-muted-foreground" />
							<input
								type="text"
								bind:value={filterSearchInput}
								placeholder="Search filters..."
								class="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
							/>
						</div>

						<div class="max-h-[24rem] overflow-y-auto">
							{#if allowAttributesFilter}
								{#each attributeFilters as { label, value, attribute, options } (attribute)}
									<div class="border-b border-border px-3 py-2.5">
										<p
											class="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
										>
											{#if attribute === 'hidden'}
												<EyeOff class="size-3" />
											{:else}
												<Star class="size-3" />
											{/if}
											{label}
										</p>
										{#if loading}
											<div class="flex items-center gap-2 px-1 py-1 text-xs text-muted-foreground">
												<LoaderCircleIcon class="size-3.5 animate-spin" />
												Loading...
											</div>
										{:else}
											{@const activeOption = options[value as string]}
											<div class="flex flex-wrap gap-x-3 gap-y-1">
												{#each Object.entries(options) as [key, option] (key)}
													{@const isActive = value === key}
													<button
														type="button"
														class="flex items-center gap-2 rounded px-1 py-1 text-xs transition-colors hover:bg-accent"
														onclick={() => {
															attributeFilters = attributeFilters.map((filter) =>
																filter.attribute === attribute ? { ...filter, value: key } : filter
															);
															if (!syncQueryParams) return;
															if (key === 'all') $page.url.searchParams.delete(attribute);
															else $page.url.searchParams.set(attribute, key);
															replaceState($page.url, $page.state);
														}}
													>
														<span
															class="flex size-3.5 shrink-0 items-center justify-center rounded-full border {isActive
																? 'border-primary bg-primary'
																: 'border-input'}"
														>
															{#if isActive}
																<span class="size-1.5 rounded-full bg-primary-foreground"></span>
															{/if}
														</span>
														<span
															class="text-left {isActive
																? 'font-medium text-foreground'
																: 'text-foreground'}">{option.label}</span
														>
													</button>
												{/each}
											</div>
											{#if activeOption?.description}
												<p class="ml-6 mt-1.5 text-[10px] leading-tight text-muted-foreground">
													{activeOption.description}
												</p>
											{/if}
										{/if}
									</div>
								{/each}
							{/if}

							<div class="px-3 py-2.5">
								<div class="mb-2 flex items-center gap-3">
									<button
										type="button"
										class="text-[10px] font-medium uppercase tracking-wide transition-colors {activeFilterTab ===
										'classifications'
											? 'text-foreground'
											: 'text-muted-foreground hover:text-foreground'}"
										onclick={() => (activeFilterTab = 'classifications')}
									>
										Classifications
										{#if !isClassificationDefault}
											<span class="ml-0.5 text-primary">({selectedClassifications.length})</span>
										{/if}
									</button>
									<button
										type="button"
										class="text-[10px] font-medium uppercase tracking-wide transition-colors {activeFilterTab ===
										'tags'
											? 'text-foreground'
											: 'text-muted-foreground hover:text-foreground'}"
										onclick={() => (activeFilterTab = 'tags')}
									>
										Tags
										{#if !isTagDefault}
											<span class="ml-0.5 text-primary">({selectedTagIds.length})</span>
										{/if}
									</button>
								</div>

								{#if loading}
									<div class="flex items-center gap-2 px-1 py-2 text-xs text-muted-foreground">
										<LoaderCircleIcon class="size-3.5 animate-spin" />
										Preparing filters...
									</div>
								{:else if activeFilterTab === 'classifications'}
									<p class="mb-1.5 text-[10px] text-muted-foreground">
										Machine-generated labels for the ad.
									</p>
									<div class="max-h-36 overflow-y-auto">
										{#each filteredClassificationOptions as label (label)}
											{@const isActive =
												!isClassificationDefault && selectedClassificationsSet.has(label)}
											<button
												type="button"
												class="flex w-full items-center gap-2 rounded px-1 py-1 text-xs transition-colors hover:bg-accent {isActive
													? 'font-medium text-primary'
													: 'text-foreground'}"
												onclick={() => toggleClassificationFilter(label)}
											>
												<span
													class="flex size-3.5 shrink-0 items-center justify-center rounded-sm border {isActive
														? 'border-primary bg-primary text-primary-foreground'
														: 'border-input'}"
												>
													{#if isActive}
														{@render checkIcon()}
													{/if}
												</span>
												<span class="min-w-0 flex-1 truncate text-left">{label}</span>
												<span class="shrink-0 px-0.5 text-[10px] text-muted-foreground">
													{filterCounts.classCounts.get(label) || 0}
												</span>
											</button>
										{/each}
										{#if filteredClassificationOptions.length === 0}
											<p class="px-1 py-2 text-xs text-muted-foreground">
												{filterSearchInput
													? 'No matching classifications'
													: 'No classifications available'}
											</p>
										{/if}
									</div>
								{:else}
									<p class="mb-1.5 text-[10px] text-muted-foreground">
										User-assigned labels for the ad.
									</p>
									<div class="max-h-36 overflow-y-auto">
										{#each filteredTagOptions as tag (tag.id ?? '__no-tag__')}
											{@const isActive = !isTagDefault && selectedTagIdSet.has(tag.id)}
											<button
												type="button"
												class="flex w-full items-center gap-2 rounded px-1 py-1 text-xs transition-colors hover:bg-accent {isActive
													? 'font-medium text-primary'
													: 'text-foreground'}"
												onclick={() => toggleTagFilter(tag.id)}
											>
												<span
													class="flex size-3.5 shrink-0 items-center justify-center rounded-sm border {isActive
														? 'border-primary bg-primary text-primary-foreground'
														: 'border-input'}"
												>
													{#if isActive}
														{@render checkIcon()}
													{/if}
												</span>
												<span
													class="size-2.5 shrink-0 rounded-full"
													style="background-color: {tag.hex};"
												></span>
												<span class="min-w-0 flex-1 truncate text-left">{tag.name}</span>
												<span class="shrink-0 px-0.5 text-[10px] text-muted-foreground">
													{filterCounts.tagCounts.get(tag.id) || 0}
												</span>
											</button>
										{/each}
										{#if filteredTagOptions.length === 0}
											<p class="px-1 py-2 text-xs text-muted-foreground">
												{filterSearchInput ? 'No matching tags' : 'No tags available'}
											</p>
										{/if}
									</div>
								{/if}
							</div>
						</div>

						{#if hasActiveFilters}
							<div class="border-t border-border px-3 py-2">
								<button
									type="button"
									class="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
									onclick={clearAllFilters}
								>
									Clear all filters
								</button>
							</div>
						{/if}
					</div>
				</Popover.Content>
			</Popover.Root>
		</div>
		<div class="flex flex-wrap items-center gap-2">
			<div class="flex items-center gap-2">
				<p class="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Group</p>
				<Dropdown
					options={groups}
					selected={groupBy.value}
					triggerClass="w-32 h-8 text-xs"
					contentClass="w-32"
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
				<p class="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Sort</p>
				<Dropdown
					options={sortOptions}
					selected={sortBy.value}
					triggerClass="w-32 h-8 text-xs"
					contentClass="w-32"
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
		<div class="flex h-full min-h-32 w-full items-center justify-center p-6 text-center">
			<p class="text-sm leading-6 text-muted-foreground">
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
							class="sticky top-0 z-10 flex w-full cursor-pointer items-center gap-2 overflow-hidden rounded-xl bg-background/90 px-3 py-2 text-left text-sm font-medium backdrop-blur-sm"
						>
							<ChevronRight
								class={twMerge(
									'z-10 size-4 shrink-0 text-muted-foreground transition',
									open ? 'rotate-90 transform' : ''
								)}
							/>
							<span class="z-10">
								{groupKey} ({adData.length} ad{adData.length > 1 ? 's' : ''})
							</span>
							<!-- Ad count bar background -->
							<div
								class="absolute left-0 top-0 h-full bg-gradient-to-r from-brand/10 to-transparent"
								style={`width: ${adCountBarWidth}`}
							></div>
						</div>
					{/snippet}

					<div transition:slide class={twMerge(adData.length > 0 ? 'py-4' : '')}>
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
