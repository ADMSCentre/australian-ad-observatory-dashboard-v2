<script lang="ts">
	import { type DateRange } from 'bits-ui';
	import DateRangePicker from '$lib/components/ui/date-range-picker/date-range-picker.svelte';
	import type { IndividualAdData } from '../[participantId]/types';
	import { dateToCalendarDate } from '../utils';
	import { Button } from '$lib/components/ui/button';

	let {
		ads,
		dateRange = $bindable()
	}: {
		ads: IndividualAdData[];
		dateRange: DateRange;
	} = $props();

	const quickSelectDateRange = (days: number) => {
		// If days = -1, show all time
		if (days === -1) {
			const firstAd = ads.at(-1);
			const lastAd = ads.at(0);
			if (!firstAd || !lastAd) return;
			dateRange = {
				start: dateToCalendarDate(new Date(firstAd.timestamp)),
				end: dateToCalendarDate(new Date(lastAd.timestamp))
			};
			return;
		}

		const today = new Date();
		const startDate = new Date(today.getTime() - 1000 * 60 * 60 * 24 * days);
		dateRange = {
			start: dateToCalendarDate(startDate),
			end: dateToCalendarDate(today)
		};
	};
</script>

<div
	class="sticky bottom-0 z-10 flex w-full items-center gap-4 border-t bg-white bg-opacity-50 py-2 backdrop-blur"
>
	<span class="font-medium"> Show between: </span>
	<DateRangePicker bind:value={dateRange} />
	<span class="font-medium"> Quick select: </span>
	<div class="flex gap-2">
		<Button
			variant="outline"
			onclick={() => {
				quickSelectDateRange(7);
			}}
			>Last 7 days
		</Button>
		<Button
			variant="outline"
			onclick={() => {
				quickSelectDateRange(14);
			}}
			>Last 14 days
		</Button>
		<Button
			variant="outline"
			onclick={() => {
				quickSelectDateRange(30);
			}}
			>Last 30 days
		</Button>
		<Button
			variant="outline"
			onclick={() => {
				quickSelectDateRange(-1);
			}}
			>All time
		</Button>
	</div>
</div>
