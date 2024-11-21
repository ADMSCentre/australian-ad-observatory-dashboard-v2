<script lang="ts">
	import type { DateRange } from 'bits-ui';
	import type { IndividualAdData } from '../observer/types';
	import AdCard, { type Props as AdCardProps } from '../observer/ad-card.svelte';
	import { dateToCalendarDate } from '../utils';

	type Props = {
		ads: IndividualAdData[];
		dateRange?: DateRange;
		cardOptions?: Omit<AdCardProps, 'adData'>;
	};

	const {
		ads,
		dateRange,
		cardOptions = {
			showObserver: true
		}
	}: Props = $props();

	const groupedAds = $derived.by(() => {
		// Filter ads by date range
		const filteredAds = ads.filter((ad) => {
			if (!dateRange) return true; // Load all ads if no date range is provided
			if (!dateRange.start || !dateRange.end) return false;
			const date = new Date(ad.timestamp);
			const calendarDate = dateToCalendarDate(date);
			return calendarDate >= dateRange.start && calendarDate <= dateRange.end;
		});

		const groupedAds = filteredAds.reduce(
			(
				acc: {
					[key: string]: IndividualAdData[];
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
</script>

<div class="relative flex flex-col gap-8">
	{#each groupedAds as [date, adData]}
		<details class="border-l-4">
			<summary
				class="sticky top-0 z-10 w-full cursor-pointer border bg-white bg-opacity-50 p-2 text-lg font-semibold backdrop-blur-sm sm:top-14"
			>
				{date} ({adData.length} ad{adData.length > 1 ? 's' : ''})
			</summary>
			<div
				class="columns-3xs break-inside-avoid-page items-start gap-4 p-2 transition-all sm:p-8 md:gap-8"
			>
				{#each adData as adData}
					<AdCard {adData} {...cardOptions} />
				{/each}
			</div>
		</details>
	{/each}
</div>

<!-- 

				class="grid grid-cols-1 items-start gap-4 p-2 sm:p-8 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
-->
