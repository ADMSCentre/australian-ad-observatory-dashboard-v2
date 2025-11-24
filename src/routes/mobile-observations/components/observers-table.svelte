<script lang="ts">
	import AgGrid from '$lib/components/ag-grid/ag-grid.svelte';
	import type { DateRange } from 'bits-ui';
	import { dateToCalendarDate, formatTimestamp } from '../../../lib/api/session/ads/utils';
	import { withBase } from '$lib/utils';
	import type { BasicAdData } from '$lib/api/session/ads/types';
	import parseActivationCode from '$lib/utils/parse-activation-code';
	import type { SortDirection } from 'ag-grid-community';

	const {
		ads,
		dateRange,
		includeObservers = []
	}: {
		ads: BasicAdData[];
		dateRange?: DateRange;
		includeObservers?: string[];
	} = $props();

	const timeRange = $derived(
		ads
			.toSorted((a, b) => b.timestamp - a.timestamp)
			.map((ad) => ad.timestamp)
			.filter((timestamp) => {
				if (!dateRange) return true;
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

		includeObservers.forEach((observer) => {
			if (!result[observer]) {
				result[observer] = {};
				timeRange.forEach((time) => {
					result[observer][time] = [];
				});
			}
		});

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
				headerName: 'Activation Code',
				field: 'activationCode',
				cellRenderer: (params: any) => {
					const observerId = params.data.observer;
					const path = withBase(`mobile-observations/observer?observer_id=${observerId}`);
					return `<a href="${path}"
						class="text-blue-600 underline"
					>
						${params.value?.toLocaleUpperCase()}
					</a>`;
				}
			},
			{
				headerName: 'Sequence Visualiser',
				field: 'sequenceVisualiser',
				cellRenderer: (params: any) => {
					const observerId = params.data.observer;
					const path = `http://ad-observatory-workshop-2025.s3-website-ap-southeast-2.amazonaws.com/observers/${observerId}`;
					return `<a href="${path}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline flex items-center gap-1">
            Visit
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
        </a>`;
				}
			},
			{
				headerName: 'Total',
				field: 'total',
				width: 100,
				sort: 'desc' as SortDirection
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

	$inspect(includeObservers, 'includeObservers');

	const rowData = $derived.by(() => {
		return Object.entries(adsByObserverAndTime).map(([observer, ads]) => {
			const row: { observer: string; activationCode: string; [key: string]: any } = {
				observer,
				activationCode: parseActivationCode(observer) || 'unknown'
			};
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

<div class="h-96">
	<AgGrid
		{columnDefs}
		{rowData}
		beforeExport={(api) => {
			// Reverse the order of the columns
			api.moveColumns(['activationCode', 'total', ...timeRange.toReversed()], 0);
		}}
		afterExport={(api) => {
			// Reset the column order to the original
			api.moveColumns(['activationCode', 'total', ...timeRange], 0);
		}}
		pagination
		paginationAutoPageSize
		class="h-full w-full"
	/>
</div>
