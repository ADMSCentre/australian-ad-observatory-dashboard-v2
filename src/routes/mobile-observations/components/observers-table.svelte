<script lang="ts">
	import AgGrid from '$lib/components/ag-grid/ag-grid.svelte';
	import type { DateRange } from 'bits-ui';
	import type { BasicAdData } from '../types';
	import { dateToCalendarDate, formatTimestamp } from '../utils';
	import { withBase } from '$lib/utils';

	const {
		ads,
		dateRange
	}: {
		ads: BasicAdData[];
		dateRange: DateRange;
	} = $props();

	const timeRange = $derived(
		ads
			.map((ad) => ad.timestamp)
			.filter((timestamp) => {
				if (!dateRange.start || !dateRange.end) return false;
				// Ensure the timestamp is between the start and end date
				const date = new Date(timestamp);
				const calendarDate = dateToCalendarDate(date);
				return calendarDate >= dateRange.start && calendarDate <= dateRange.end;
			})
			.reduce((acc, timestamp) => {
				const dateString = formatTimestamp(timestamp);
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
					timestamp: number;
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
			const dateString = formatTimestamp(ad.timestamp);
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
			{
				headerName: 'Observer',
				field: 'observer',
				width: 110,
				cellRenderer: (params: any) => {
					const path = withBase(`mobile-observations/observer?observer_id=${params.value}`);
					return `<a href="${path}"
						class="text-blue-600 underline"
					>
						${params.value}
					</a>`;
				}
			},
			{
				headerName: 'Total',
				field: 'total',
				width: 100
			},
			...[...timeRange].map((time) => ({
				headerName: time,
				field: time,
				wrapHeaderText: true,
				autoHeaderHeight: true,
				width: 125
			}))
		];
	});

	const rowData = $derived.by(() => {
		return Object.entries(adsByObserverAndTime).map(([observer, ads]) => {
			const row: { observer: string; [key: string]: any } = { observer };
			let total = 0;
			timeRange.forEach((time) => {
				row[time] = ads[time].length;
				total += ads[time].length;
			});
			row.total = total;
			return row;
		});
	});
</script>

<AgGrid
	{columnDefs}
	{rowData}
	pagination
	paginationAutoPageSize
	style={{
		height: '540px',
		width: '100%'
	}}
/>
