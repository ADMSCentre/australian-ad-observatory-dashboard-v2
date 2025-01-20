<script lang="ts">
	import type { DateRange } from 'bits-ui';
	import type { BasicAdData, RichAdData } from '$lib/api/session/ads/types';
	import AdCard, { type Props as AdCardProps, type AdElement } from './ad-card.svelte';
	import { dateToCalendarDate } from '../../../lib/api/session/ads/utils';
	import Accordion from '$lib/components/accordion/accordion.svelte';
	import { ChevronDown, ChevronRight, SearchIcon } from 'lucide-svelte';
	import { twMerge } from 'tailwind-merge';
	import { scale, slide } from 'svelte/transition';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { getExpandedRowModel } from '@tanstack/table-core';
	import AdCardBody from './ad-card-body.svelte';
	import AdRichView from './rich-view/ad-rich-view.svelte';
	import { WindowVirtualizer } from 'virtua/svelte';
	import { untrack } from 'svelte';
	import { flip } from 'svelte/animate';
	import Dropdown from '$lib/components/dropdown/dropdown.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { page } from '$app/stores';
	import { goto, replaceState } from '$app/navigation';

	type Props = {
		ads: RichAdData[];
		dateRange?: DateRange;
		open?: boolean;
		cardOptions?: Omit<AdCardProps, 'adData'>;
		filters?: ((ad: RichAdData) => boolean)[];
		richViewExpanded?: boolean;
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
		filters = [],
		richViewExpanded = $bindable(false)
	}: Props = $props();

	const defaultSearchKey = $page.url.searchParams.get('search') || '';
	const sortParam = $page.url.searchParams.get('sort');
	const groupParam = $page.url.searchParams.get('group');

	// For expanded (rich) view
	let currentAd = $state<RichAdData | null>(null);

	// Grouping and sorting
	const groups = [
		{
			value: 'date',
			label: 'Date',
			getKey: (ad: RichAdData) => ad.date
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
		}
	];

	let groupBy = $state(groups.find((g) => g.value === groupParam) || groups[0]);
	let sortBy = $state(sortOptions.find((s) => s.value === sortParam) || sortOptions[0]);
	let searchKey = $state(defaultSearchKey);

	const debounce = (fn: Function, delay: number) => {
		let timeout: NodeJS.Timeout;
		return (...args: any[]) => {
			clearTimeout(timeout);
			timeout = setTimeout(() => fn(...args), delay);
		};
	};
	const searchDebounce = debounce((value: string) => {
		searchKey = value;
		if (searchKey.length > 0) $page.url.searchParams.set('search', searchKey);
		else $page.url.searchParams.delete('search');
		replaceState($page.url, $page.state);
	}, 300);

	const groupedAds = $derived.by(() => {
		const searchFilter = (ad: RichAdData) => {
			if (!searchKey) return true;
			return ad.adId.toLowerCase().includes(searchKey.toLowerCase());
		};

		// Filter ads by date range
		const filteredAds = ads
			.filter((ad) => {
				if (!dateRange) return true; // Load all ads if no date range is provided
				if (!dateRange.start || !dateRange.end) return false;
				const date = new Date(ad.timestamp);
				const calendarDate = dateToCalendarDate(date);
				return calendarDate >= dateRange.start && calendarDate <= dateRange.end;
			})
			.filter((ad) => filters.every((filter) => filter(ad)))
			.toSorted(sortBy.sort);

		const groupedAds = filteredAds.reduce(
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
		console.log('Completed filtering ads');
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
				placeholder="Search by Ad ID..."
				value={searchKey}
				oninput={(e) => {
					const target = e.target as HTMLInputElement;
					searchDebounce(target.value);
				}}
				class="pl-8"
			/>
			<SearchIcon class="absolute left-2 top-1/2 -translate-y-1/2 transform" size={20} />
		</div>
		<div class="flex items-center gap-2">
			<div class="flex items-center gap-2">
				<p>Group by:</p>
				<Dropdown
					options={groups}
					selected={groupBy.value}
					onSelected={(option: string) => {
						groupBy = groups.find((g) => g.value === option) || groups[0];
						// Update URL
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
					onSelected={(option: string) => {
						sortBy = sortOptions.find((s) => s.value === option) || sortOptions[0];
						// Update URL
						$page.url.searchParams.set('sort', sortBy.value);
						replaceState($page.url, $page.state);
					}}
				/>
			</div>
		</div>
	</div>

	{#each groupedAds as [groupKey, adData]}
		{@const rowData = createGroup(adData)}
		{@const adCountBarWidth = (adData.length / maxAdsCount) * 100 + '%'}
		<Accordion {open} class="w-full">
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

				<WindowVirtualizer data={rowData} overscan={1}>
					{#snippet children(item, index)}
						<div class="flex w-full flex-col items-center" transition:scale={{ duration: 300 }}>
							<div
								class="grid w-full gap-10"
								style={`grid-template-columns: repeat(${groupSize}, 1fr)`}
							>
								{#each item as adData (adData.adId)}
									<div animate:flip={{ duration: 150 }} transition:scale={{ duration: 150 }}>
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
	{/each}
</div>

<AdRichView bind:richViewExpanded bind:currentAd />

<!-- 

				class="grid grid-cols-1 items-start gap-4 p-2 sm:p-8 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
-->
