<script lang="ts">
	import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
	import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
	import type { DateRange } from 'bits-ui';
	import { dateToCalendarDate } from './utils';
	import type { BasicAdData } from './observer/types';
	import ObservationsTimeline from './components/observations-timeline.svelte';
	import ObserversTable from './components/observers-table.svelte';
	import Filters from './components/filters.svelte';
	import AdsBrowser from './components/ads-browser.svelte';

	let {
		ads = $bindable()
	}: {
		ads: BasicAdData[];
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

<h1>Observations Timeline</h1>

The timeline below shows the number of observations identified as ads over time.

<ObservationsTimeline {ads} {dateRange} />

<h1>Observers</h1>

The table below shows the number of ads each observer has seen on each day. Click on the observer's
ID to view all the ads collected by that observer.

<ObserversTable {ads} {dateRange} />

<h1>Ads Browser</h1>

Expand each date to see the ads that were observed on that day by all observers.

<AdsBrowser bind:ads {dateRange} />

<Filters {ads} bind:dateRange />
