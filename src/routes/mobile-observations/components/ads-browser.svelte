<script lang="ts">
	import type { DateRange } from 'bits-ui';
	import type { BasicAdData, ExpandType, RichAdData } from '$lib/api/session/ads/types';
	import AdCard, { type Props as AdCardProps, type AdElement } from './ad-card/ad-card.svelte';
	import { dateToCalendarDate } from '../../../lib/api/session/ads/utils';
	import Accordion from '$lib/components/accordion/accordion.svelte';
	import { ChevronRight, LoaderCircleIcon, SearchIcon } from 'lucide-svelte';
	import { twMerge } from 'tailwind-merge';
	import { slide } from 'svelte/transition';
	import AdRichView from './rich-view/ad-rich-view.svelte';
	import { WindowVirtualizer } from 'virtua/svelte';
	import { untrack } from 'svelte';
	import { flip } from 'svelte/animate';
	import Dropdown from '$lib/components/dropdown/dropdown.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { page } from '$app/stores';
	import { replaceState } from '$app/navigation';
	import { session } from '$lib/api/session/session.svelte';

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
	};

	let {
		// The ad is bindable so that if a component
		// requires the ad to be expanded, it can
		// update this prop
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
		enableAttributeFilter: attributeFilter = true
	}: Props = $props();

	const defaultSearchKey = params.search || $page.url.searchParams.get('search') || '';
	const sortParam = params.sort || $page.url.searchParams.get('sort') || '';
	const groupParam = params.group || $page.url.searchParams.get('group') || 'date';

	// For expanded (rich) view
	let currentAd = $state<RichAdData | null>(null);

	// Enrich the ads with attributes
	let loading = $state(false);
	const allowAttributesFilter = $derived(ads.length > 0 && attributeFilter);
	$effect(() => {
		ads.length;
		console.log('ads length changed, checking attributes...');
		untrack(() => {
			session.tags.fetch();

			const enrichBatch = async (types: ExpandType[]) => {
				loading = true;
				const BATCH_SIZE = 30000;
				const batches = [];
				for (let i = 0; i < ads.length; i += BATCH_SIZE) {
					batches.push(ads.slice(i, i + BATCH_SIZE));
				}
				await Promise.all(
					batches.map((batch) => {
						return session.ads.getEnrichedData(batch, types, {
							updateMemoryCache: true
						});
					})
				);
				await Promise.all(
					ads.map((ad) => {
						return session.ads.enrich(ad, types);
					})
				);
				loading = false;
			};

			enrichBatch(['tags']); // Always enrich tags
			if (allowAttributesFilter) enrichBatch(['attributes']);
		});
	});

	// Grouping and sorting
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

	$effect(() => {
		// Once the tags are loaded, select all tags
		if (session.tags.loading) return;
		untrack(() => {
			if (selectedTagIds.length === 0) {
				selectedTagIds = [...session.tags.all.map((t) => t.id), null];
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
	const searchDebounce = debounce((value: string) => {
		searchKey = value;
		if (!syncQueryParams) return;
		if (searchKey.length > 0) $page.url.searchParams.set('search', searchKey);
		else $page.url.searchParams.delete('search');
		replaceState($page.url, $page.state);
	}, 300);

	const groupedAds = $derived.by(() => {
		const searchFilter = (ad: RichAdData) => {
			if (!searchKey) return true;
			return (
				ad.adId.toLowerCase().includes(searchKey.toLowerCase()) ||
				ad.observer.toLowerCase().includes(searchKey.toLowerCase())
			);
		};

		const filteredAds = ads
			// Filter ads by date range
			.filter((ad) => {
				if (!dateRange) return true; // Load all ads if no date range is provided
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
		console.log(
			`Filtered ${ads.length} ads to ${adsEntries.length} groups with ${filteredAds.length} ads`
		);
		return adsEntries;
	});

	const getIndex = (ad: RichAdData) => ads.findIndex((a) => a.adId === ad.adId);
	const onSingleAdExpand = (ad: RichAdData) => {
		currentAd = ad;
		richViewExpanded = true;
	};
	const maxAdsCount = $derived(Math.max(...groupedAds.map(([, ads]) => ads.length)));

	let clientWidth = $state(0);
	const MAX_AD_WIDTH = 384; // px
	const PADDING = 40; // px

	let resizeTimeout = $state<NodeJS.Timeout | null>(null);
	let groupSize = $state(1);

	$effect(() => {
		clientWidth;
		untrack(() => {
			if (resizeTimeout) clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(() => {
				groupSize = Math.floor(clientWidth / (MAX_AD_WIDTH - PADDING));
				if (groupSize < 1) groupSize = 1;
			}, 50);
		});
	});

	const createGroup = $derived((adData: BasicAdData[]) => {
		const groups = [];
		for (let i = 0; i < adData.length; i += groupSize) {
			groups.push(adData.slice(i, i + groupSize));
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

<div class="relative flex flex-col gap-4" bind:clientWidth>
	<!-- Controls (grouping, ordering) -->
	<div
		class="flex flex-col items-end gap-2 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4"
	>
		<div class="relative flex items-center gap-2">
			<Input
				placeholder="Filter by user or ad ID..."
				value={searchKey}
				oninput={(e) => {
					const target = e.target as HTMLInputElement;
					searchDebounce(target.value);
				}}
				class="pl-8"
			/>
			<SearchIcon class="absolute left-2 top-1/2 -translate-y-1/2 transform" size={20} />

			{#if allowAttributesFilter}
				<div class="flex items-center gap-2">
					{#each attributeFilterOptions as { label, value, attribute }}
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
								triggerClass="w-fit"
								contentClass="w-fit"
								disabled={loading}
								selected={value}
								onSelected={(option) => {
									const selectedOption = option as boolean | 'all';
									attributeFilters = attributeFilters.map((filter) =>
										filter.attribute === attribute ? { ...filter, value: selectedOption } : filter
									);
									if (!syncQueryParams) return;
									if (selectedOption === 'all') $page.url.searchParams.delete(attribute);
									else $page.url.searchParams.set(attribute, selectedOption.toString());
									replaceState($page.url, $page.state);
								}}
							/>
						{/if}
					{/each}
				</div>
			{/if}

			<div class="flex items-center gap-2">
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
						disabled={session.tags.loading}
						bind:selected={selectedTagIds}
						clearable={true}
						searchable={true}
						allowSelectAll={true}
					/>
				{/if}
			</div>
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

	{#if groupedAds.length === 0}
		<div class="flex h-full w-full items-center justify-center">
			<p class="text-muted-foreground">
				There are {ads.length} ad{ads.length > 1 ? 's' : ''} in the sample, but none match the filters.
				Try changing the filters to see the ads.
			</p>
		</div>
	{/if}

	{#each groupedAds as [groupKey, adData], index (groupKey)}
		{@const rowData = createGroup(adData)}
		{@const adCountBarWidth = (adData.length / maxAdsCount) * 100 + '%'}
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
						<ChevronRight class={twMerge('size-4 transition', open ? 'rotate-90 transform' : '')} />
						{groupKey} ({adData.length} ad{adData.length > 1 ? 's' : ''})
						<!-- Ad count bar background -->
						<div
							class="absolute left-0 top-0 h-full bg-gradient-to-r from-foreground/25 to-transparent"
							style={`width: ${adCountBarWidth}`}
						></div>
					</div>
				{/snippet}
				<div transition:slide class={twMerge(adData.length > 0 ? 'p-4' : '')}>
					<!-- {#each adData as adData, i}
						<AdCard
							adData={ads[getIndex(adData)]}
							{...cardOptions}
							onExpand={() => onSingleAdExpand(ads[getIndex(adData)])}
							class="grid grid-rows-[64px_384px_64px]"
						/>
					{/each} -->
					<WindowVirtualizer data={rowData} overscan={3} itemSize={450}>
						{#snippet children(item, index)}
							<div class="flex w-full flex-col items-center">
								<div
									class="grid w-full gap-10"
									style={`grid-template-columns: repeat(${groupSize}, 1fr)`}
								>
									{#each item as adData (adData.adId)}
										<div class="will-change-transform">
											<AdCard
												adData={ads[getIndex(adData)]}
												{exclude}
												onExpand={() => onSingleAdExpand(ads[getIndex(adData)])}
												class="grid w-full grid-rows-[auto_384px_auto]"
											/>
										</div>
									{/each}
								</div>
							</div>
						{/snippet}
					</WindowVirtualizer>
				</div>
			</Accordion>
		</div>
	{/each}
</div>

<AdRichView bind:richViewExpanded bind:currentAd />

<!-- 

				class="grid grid-cols-1 items-start gap-4 p-2 sm:p-8 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
-->
