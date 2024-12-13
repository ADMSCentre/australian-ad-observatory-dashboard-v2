<script lang="ts">
	import type { DateRange } from 'bits-ui';
	import type { BasicAdData, RichAdData } from '../types';
	import AdCard, { type Props as AdCardProps } from './ad-card.svelte';
	import { dateToCalendarDate } from '../utils';
	import Accordion from '$lib/components/accordion/accordion.svelte';
	import { ChevronDown, ChevronRight } from 'lucide-svelte';
	import { twMerge } from 'tailwind-merge';
	import { slide } from 'svelte/transition';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { getExpandedRowModel } from '@tanstack/table-core';
	import AdCardBody from './ad-card-body.svelte';
	import AdRichView from './ad-rich-view.svelte';

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
			showObserver: true
		},
		filters = [],
		richViewExpanded = $bindable(false)
	}: Props = $props();

	let currentAd = $state<RichAdData | null>(null);
	const groupedAds = $derived.by(() => {
		// Filter ads by date range
		const filteredAds = ads
			.filter((ad) => {
				if (!dateRange) return true; // Load all ads if no date range is provided
				if (!dateRange.start || !dateRange.end) return false;
				const date = new Date(ad.timestamp);
				const calendarDate = dateToCalendarDate(date);
				return calendarDate >= dateRange.start && calendarDate <= dateRange.end;
			})
			.filter((ad) => filters.every((filter) => filter(ad)));

		const groupedAds = filteredAds.reduce(
			(
				acc: {
					[key: string]: BasicAdData[];
				},
				ad
			) => {
				if (!acc[ad.date]) acc[ad.date] = [];
				acc[ad.date].push(ad);
				return acc;
			},
			{}
		);
		// Convert to entries, sort by date
		const adsEntries = Object.entries(groupedAds).toSorted(
			([a], [b]) => new Date(b).getTime() - new Date(a).getTime()
		);
		return adsEntries;
	});

	const getIndex = (ad: RichAdData) => ads.findIndex((a) => a.adId === ad.adId);
	const onSingleAdExpand = (ad: RichAdData) => {
		currentAd = ad;
		richViewExpanded = true;
	};
	const maxAdsCount = $derived(Math.max(...groupedAds.map(([, ads]) => ads.length)));
</script>

<div class="relative flex flex-col gap-4">
	{#each groupedAds as [date, adData]}
		{@const adCountBarWidth = (adData.length / maxAdsCount) * 100 + '%'}
		<Accordion {open} class="w-full">
			{#snippet summary(open)}
				<div
					class="sticky top-0 z-10 flex w-full cursor-pointer items-center gap-2 border-b bg-background bg-opacity-50 p-2 text-left font-medium backdrop-blur-sm"
				>
					<ChevronRight class={twMerge('size-4 transition', open ? 'rotate-90 transform' : '')} />
					{date} ({adData.length} ad{adData.length > 1 ? 's' : ''})
					<!-- Ad count bar background -->
					<div
						class="absolute left-0 top-0 h-full bg-gradient-to-r from-foreground/25 to-transparent"
						style={`width: ${adCountBarWidth}`}
					></div>
				</div>
			{/snippet}
			<div
				class="columns-xs break-inside-avoid-page items-start gap-10 p-2 transition-all sm:p-8"
				transition:slide
			>
				{#each adData as adData, i}
					<AdCard
						bind:adData={ads[getIndex(adData)]}
						{...cardOptions}
						onExpand={() => onSingleAdExpand(ads[getIndex(adData)])}
					/>
				{/each}
			</div>
		</Accordion>
	{/each}
</div>

<AdRichView bind:richViewExpanded bind:currentAd />

<!-- 

				class="grid grid-cols-1 items-start gap-4 p-2 sm:p-8 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
-->
