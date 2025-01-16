<script lang="ts">
	import type { DateRange } from 'bits-ui';
	import type { BasicAdData } from '../types';
	import { dateToCalendarDate } from '../../../lib/api/session/ads/utils';
	import Timeline from './timeline.svelte';

	const {
		ads,
		dateRange
	}: {
		ads: BasicAdData[];
		dateRange?: DateRange;
	} = $props();

	const timestamps = $derived(
		ads
			.filter((ad) => {
				if (!dateRange) return true; // Load all ads if no date range is provided
				if (!dateRange.start || !dateRange.end) return false;
				// Ensure the timestamp is between the start and end date
				const date = new Date(ad.timestamp);
				const calendarDate = dateToCalendarDate(date);
				return calendarDate >= dateRange.start && calendarDate <= dateRange.end;
			})
			.map((ad) => ad.timestamp)
	);
</script>

<div class="rounded border p-4 shadow dark:shadow-zinc-800">
	<Timeline {timestamps} />
</div>
