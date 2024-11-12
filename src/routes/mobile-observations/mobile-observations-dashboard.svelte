<script lang="ts">
	import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
	import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
	import type { DateRange } from 'bits-ui';
	import { dateToCalendarDate } from './utils';
	import type { IndividualAdData } from './[participantId]/types';
	import ObservationsTimeline from './components/observations-timeline.svelte';
	import ObserversTable from './components/observers-table.svelte';
	import Filters from './components/filters.svelte';
	import AdsBrowser from './components/ads-browser.svelte';

	const {
		ads
	}: {
		ads: IndividualAdData[];
	} = $props();

	const computeDateRange = () => {
		// Since the ads are sorted by timestamp, firstAd is the oldest and lastAd is the newest
		const firstAd = ads.at(-1);
		const lastAd = ads.at(0);
		const today = new Date();
		if (!firstAd || !lastAd) {
			return {
				start: dateToCalendarDate(today),
				end: dateToCalendarDate(today)
			};
		}
		// Convert the timestamps to dates
		// const endDate = new Date(lastAd.timestamp);
		const endDate = new Date(today);
		const startDate = new Date(endDate.getTime() - 1000 * 60 * 60 * 24 * 7);
		return {
			start: dateToCalendarDate(startDate),
			end: dateToCalendarDate(endDate)
		};
	};

	let dateRange: DateRange = $state(computeDateRange());
</script>

<ObservationsTimeline {ads} {dateRange} />

<ObserversTable {ads} {dateRange} />

<AdsBrowser {ads} {dateRange} />

<Filters {ads} bind:dateRange />
