<script lang="ts">
	import type { DateRange } from 'bits-ui';
	import type { IndividualAdData } from '../observer/types';
	import { dateToCalendarDate } from '../utils';
	import Timeline from './timeline.svelte';

	const {
		ads,
		dateRange
	}: {
		ads: IndividualAdData[];
		dateRange: DateRange;
	} = $props();

	const timestamps = $derived(
		ads
			.filter((ad) => {
				if (!dateRange.start || !dateRange.end) return false;
				// Ensure the timestamp is between the start and end date
				const date = new Date(ad.timestamp);
				const calendarDate = dateToCalendarDate(date);
				return calendarDate >= dateRange.start && calendarDate <= dateRange.end;
			})
			.map((ad) => ad.timestamp)
	);
</script>

<h1>Observations Timeline</h1>

The timeline below shows the number of observations identified as ads over time.

<Timeline {timestamps} />
