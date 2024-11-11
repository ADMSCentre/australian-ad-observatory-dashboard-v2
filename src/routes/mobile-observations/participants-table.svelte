<script lang="ts">
	import AgGrid from '$lib/components/ag-grid/ag-grid.svelte';
	import DateRangePicker from '$lib/components/ui/date-range-picker/date-range-picker.svelte';
	import { CalendarDate, toCalendarDate } from '@internationalized/date';
	import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
	import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
	import type { DateRange } from 'bits-ui';
	import Timeline from './timeline.svelte';

	const {
		adsIndex
	}: {
		adsIndex: {
			[key: string]: {
				observer: string;
				timestamp: string;
				adId: string;
				path: string;
			}[];
		};
	} = $props();

	const ads = $derived(
		adsIndex['ads'].toSorted((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp))
	);
	const timestamps = $derived(
		ads
			.filter((ad) => {
				if (!dateRange.start || !dateRange.end) return false;
				// Ensure the timestamp is between the start and end date
				const date = new Date(parseInt(ad.timestamp));
				const calendarDate = new CalendarDate(
					date.getFullYear(),
					date.getMonth() + 1,
					date.getDate()
				);
				return calendarDate >= dateRange.start && calendarDate <= dateRange.end;
			})
			.map((ad) => parseInt(ad.timestamp))
	);
	const computeDateRange = () => {
		const firstAd = ads.at(-1);
		const lastAd = ads.at(0);
		if (!firstAd || !lastAd) {
			const today = new Date();
			return {
				start: new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate()),
				end: new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate())
			};
		}
		// Convert the timestamps to dates
		// const startDate = new Date(parseInt(firstAd.timestamp));
		const endDate = new Date(parseInt(lastAd.timestamp));
		const startDate = new Date(endDate.getTime() - 1000 * 60 * 60 * 24 * 7);
		return {
			start: new CalendarDate(
				startDate.getFullYear(),
				startDate.getMonth() + 1,
				startDate.getDate()
			),
			end: new CalendarDate(endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate())
		};
	};
	let dateRange: DateRange = $state(computeDateRange());

	const parseTime = (timestamp: string) => {
		const date = new Date(parseInt(timestamp));
		const options = {
			year: '2-digit' as '2-digit',
			month: 'numeric' as 'numeric',
			day: 'numeric' as 'numeric',
			weekday: 'short' as 'short'
		};
		// return date.toDateString();
		// DD/MM/YY format
		return new Intl.DateTimeFormat('en-US', options).format(date);
	};

	const timeRange = $derived(
		ads
			.map((ad) => ad.timestamp)
			.filter((timestamp) => {
				if (!dateRange.start || !dateRange.end) return false;
				// Ensure the timestamp is between the start and end date
				const date = new Date(parseInt(timestamp));
				const calendarDate = new CalendarDate(
					date.getFullYear(),
					date.getMonth() + 1,
					date.getDate()
				);
				return calendarDate >= dateRange.start && calendarDate <= dateRange.end;
			})
			.reduce((acc, timestamp) => {
				const dateString = parseTime(timestamp);
				if (!acc.includes(dateString)) {
					acc.push(dateString);
				}
				return acc;
			}, [] as string[])
	);
	// Group the ads by observer and time range
	const adsByObserverAndTime = $derived.by(() => {
		const result: {
			[observer: string]: {
				[time: string]: {
					adId: string;
					timestamp: string;
					path: string;
				}[];
			};
		} = {};

		ads.forEach((ad) => {
			if (!result[ad.observer]) {
				result[ad.observer] = {};
				timeRange.forEach((time) => {
					result[ad.observer][time] = [];
				});
			}
			const dateString = parseTime(ad.timestamp);
			result[ad.observer][dateString]?.push({
				adId: ad.adId,
				timestamp: ad.timestamp,
				path: ad.path
			});
		});

		return result;
	});

	const columnDefs = $derived.by(() => {
		console.log('Recomputing columnDefs');
		return [
			{ headerName: 'Observer', field: 'observer', width: 300 },
			...[...timeRange].map((time) => ({
				headerName: time,
				field: time,
				wrapHeaderText: true,
				autoHeaderHeight: true,
				width: 90
			}))
		];
	});

	const rowData = $derived.by(() => {
		console.log('Recomputing rowData');
		return Object.entries(adsByObserverAndTime).map(([observer, ads]) => {
			const row: { observer: string; [key: string]: any } = { observer };
			timeRange.forEach((time) => {
				row[time] = ads[time].length;
			});
			return row;
		});
	});
</script>

<div class="flex items-center gap-4">
	<span class="font-medium"> Show between: </span>
	<DateRangePicker bind:value={dateRange} />
</div>

{#if rowData}
	<AgGrid
		{columnDefs}
		{rowData}
		style={{
			height: '500px',
			width: '100%'
		}}
	/>
{/if}

<Timeline {timestamps} />
