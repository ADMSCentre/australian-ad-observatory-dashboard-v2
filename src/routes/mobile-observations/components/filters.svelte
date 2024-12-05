<script lang="ts">
	import { type DateRange } from 'bits-ui';
	import DateRangePicker from '$lib/components/ui/date-range-picker/date-range-picker.svelte';
	import type { BasicAdData } from '../observer/types';
	import { dateToCalendarDate } from '../utils';
	import { Button } from '$lib/components/ui/button';
	import Dropdown from '$lib/components/dropdown/dropdown.svelte';

	let {
		ads,
		dateRange = $bindable()
	}: {
		ads: BasicAdData[];
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
	class="sticky bottom-0 z-10 flex w-full flex-col items-start gap-2 border-t bg-white bg-opacity-50 py-2 text-sm backdrop-blur sm:flex-row sm:items-center sm:gap-4"
>
	<div class="flex items-center gap-2">
		<span> Show between: </span>
		<DateRangePicker bind:value={dateRange} />
	</div>
	<div class="flex items-center gap-2">
		<span> Quick select: </span>
		<Dropdown
			options={[
				{
					value: 7,
					label: 'Last 7 days'
				},
				{
					value: 14,
					label: 'Last 14 days'
				},
				{
					value: 30,
					label: 'Last 30 days'
				},
				{
					value: -1,
					label: 'All time'
				}
			]}
			onSelected={(value) => {
				quickSelectDateRange(value);
			}}
		/>
	</div>
</div>
