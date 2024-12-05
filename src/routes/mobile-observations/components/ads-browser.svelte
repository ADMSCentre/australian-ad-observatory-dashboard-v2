<script lang="ts">
	import type { DateRange } from 'bits-ui';
	import type { BasicAdData, RichAdData } from '../observer/types';
	import AdCard, { type Props as AdCardProps } from '../observer/ad-card.svelte';
	import { dateToCalendarDate } from '../utils';
	import Accordion from '$lib/components/accordion/accordion.svelte';
	import { ChevronDown, ChevronRight } from 'lucide-svelte';
	import { twMerge } from 'tailwind-merge';
	import { slide } from 'svelte/transition';

	type Props = {
		ads: RichAdData[];
		dateRange?: DateRange;
		open?: boolean;
		cardOptions?: Omit<AdCardProps, 'adData'>;
		filters?: ((ad: RichAdData) => boolean)[];
	};

	const {
		ads = $bindable(),
		dateRange,
		open,
		cardOptions = {
			showObserver: true
		},
		filters = []
	}: Props = $props();

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
</script>

<div class="relative flex flex-col gap-4">
	{#each groupedAds as [date, adData]}
		<Accordion {open} class="w-full">
			{#snippet summary(open)}
				<div
					class="sticky top-0 z-10 flex w-full cursor-pointer items-center gap-2 border-b bg-white bg-opacity-50 p-2 text-left font-medium backdrop-blur-sm"
				>
					<ChevronRight class={twMerge('size-4 transition', open ? 'rotate-90 transform' : '')} />
					{date} ({adData.length} ad{adData.length > 1 ? 's' : ''})
				</div>
			{/snippet}
			<div
				class="columns-xs break-inside-avoid-page items-start gap-10 p-2 transition-all sm:p-8"
				transition:slide
			>
				{#each adData as adData, i}
					<AdCard bind:adData={ads[getIndex(adData)]} {...cardOptions} />
				{/each}
			</div>
		</Accordion>
	{/each}
</div>

<!-- 

				class="grid grid-cols-1 items-start gap-4 p-2 sm:p-8 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
-->
