<script lang="ts">
	import { browser } from '$app/environment';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import type { BasicAdData } from '$lib/api/session/ads/types';
	import { dateToCalendarDate } from '$lib/api/session/ads/utils';
	import parseActivationCode from '$lib/utils/parse-activation-code';
	import { withBase } from '$lib/utils';
	import type { DateRange } from 'bits-ui';
	import {
		ArrowDown,
		ArrowUp,
		ChevronLeft,
		ChevronRight,
		DownloadIcon,
		ExternalLink,
		Grid3x3,
		Info,
		Search,
		Table2,
		Users
	} from 'lucide-svelte';

	type ActivityView = 'heatmap' | 'table';
	type SortColumn = 'activationCode' | 'total' | `date:${string}` | null;

	type ActivityRow = {
		observer: string;
		activationCode: string;
		observationIds: Set<string>;
		total: number;
		daily: Map<string, number>;
	};

	type ActivityTooltip = {
		activationCode: string;
		date: string;
		count: number;
		left: number;
		top: number;
	};

	const OBSERVERS_PER_PAGE = 10;
	const SEQUENCE_VISUALISER_URL =
		'http://ad-observatory-workshop-2025.s3-website-ap-southeast-2.amazonaws.com/observers';

	const {
		ads,
		dateRange,
		includeObservers = []
	}: {
		ads: BasicAdData[];
		dateRange?: DateRange;
		includeObservers?: string[];
	} = $props();

	let activityView = $state<ActivityView>('table');
	let searchQuery = $state('');
	let observerPageStart = $state(0);
	let sortColumn = $state<SortColumn>(null);
	let sortDirection = $state<'asc' | 'desc'>('desc');
	let activityTooltip = $state<ActivityTooltip | null>(null);

	const filteredAds = $derived(
		ads.filter((ad) => {
			if (!dateRange) return true;
			if (!dateRange.start || !dateRange.end) return false;

			const calendarDate = dateToCalendarDate(new Date(ad.timestamp));
			return calendarDate >= dateRange.start && calendarDate <= dateRange.end;
		})
	);

	const activityDates = $derived.by(() => {
		const dates = new Set<string>();

		for (const ad of filteredAds) {
			dates.add(getActivityDateKey(ad.timestamp));
		}

		return [...dates].sort((a, b) => b.localeCompare(a));
	});

	const heatmapLabelDates = $derived.by(() => {
		const labels = new Set<string>();
		if (activityDates.length === 0) return labels;

		const labelCount = Math.min(6, activityDates.length);
		for (let index = 0; index < labelCount; index += 1) {
			const dateIndex =
				labelCount === 1 ? 0 : Math.round((index * (activityDates.length - 1)) / (labelCount - 1));
			labels.add(activityDates[dateIndex]);
		}

		return labels;
	});

	const allActivityRows = $derived.by((): ActivityRow[] => {
		const rowsByObserver = new Map<string, ActivityRow>();

		for (const observer of includeObservers) {
			rowsByObserver.set(observer, createActivityRow(observer));
		}

		for (const ad of filteredAds) {
			const row = rowsByObserver.get(ad.observer) ?? createActivityRow(ad.observer);
			const date = getActivityDateKey(ad.timestamp);

			row.total += 1;
			row.observationIds.add(ad.adId);
			row.daily.set(date, (row.daily.get(date) ?? 0) + 1);
			rowsByObserver.set(ad.observer, row);
		}

		return [...rowsByObserver.values()];
	});

	const normalizedSearchQuery = $derived(searchQuery.trim().toLocaleLowerCase());

	const activityRows = $derived.by(() => {
		return allActivityRows
			.filter((row) => {
				if (!normalizedSearchQuery) return true;

				return (
					row.observer.toLocaleLowerCase().includes(normalizedSearchQuery) ||
					row.activationCode.toLocaleLowerCase().includes(normalizedSearchQuery) ||
					[...row.observationIds].some((id) =>
						id.toLocaleLowerCase().includes(normalizedSearchQuery)
					)
				);
			})
			.sort((a, b) => {
				const direction = sortDirection === 'asc' ? 1 : -1;

				if (sortColumn === null) {
					const totalDifference = b.total - a.total;
					if (totalDifference !== 0) return totalDifference;
					return compareActivationCodes(a, b);
				}

				if (sortColumn === 'activationCode') {
					return compareActivationCodes(a, b) * direction;
				}

				if (sortColumn === 'total') {
					const totalDifference = (a.total - b.total) * direction;
					return totalDifference || compareActivationCodes(a, b);
				}

				const date = sortColumn.slice(5);
				const dateDifference = ((a.daily.get(date) ?? 0) - (b.daily.get(date) ?? 0)) * direction;
				return dateDifference || compareActivationCodes(a, b);
			});
	});

	const observerPageOffset = $derived(
		Math.min(
			observerPageStart,
			Math.max(0, (Math.ceil(activityRows.length / OBSERVERS_PER_PAGE) - 1) * OBSERVERS_PER_PAGE)
		)
	);
	const visibleActivityRows = $derived(
		activityRows.slice(observerPageOffset, observerPageOffset + OBSERVERS_PER_PAGE)
	);
	const hasPreviousObserverPage = $derived(observerPageOffset > 0);
	const hasNextObserverPage = $derived(
		observerPageOffset + OBSERVERS_PER_PAGE < activityRows.length
	);

	const maxDailyCount = $derived.by(() => {
		let max = 0;

		for (const row of activityRows) {
			for (const count of row.daily.values()) {
				max = Math.max(max, count);
			}
		}

		return max;
	});

	function createActivityRow(observer: string): ActivityRow {
		return {
			observer,
			activationCode: parseActivationCode(observer)?.toLocaleUpperCase() || 'UNKNOWN',
			observationIds: new Set<string>(),
			total: 0,
			daily: new Map<string, number>()
		};
	}

	function compareActivationCodes(a: ActivityRow, b: ActivityRow): number {
		return a.activationCode.localeCompare(b.activationCode, undefined, { sensitivity: 'base' });
	}

	function getActivityDateKey(timestamp: number): string {
		const date = new Date(timestamp);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	function formatActivityDate(date: string): string {
		return new Date(`${date}T00:00:00`).toLocaleDateString('en-AU', {
			day: 'numeric',
			month: 'short'
		});
	}

	function formatActivityWeekday(date: string): string {
		return new Date(`${date}T00:00:00`).toLocaleDateString('en-AU', {
			weekday: 'short'
		});
	}

	function formatActivityFullDate(date: string): string {
		return new Date(`${date}T00:00:00`).toLocaleDateString('en-AU', {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function formatObservationCount(count: number): string {
		return `${count} observation${count === 1 ? '' : 's'}`;
	}

	function getActivityGridStyle(dateCount: number): string {
		return `grid-template-columns: minmax(8rem, 10rem) repeat(${Math.max(dateCount, 1)}, 0.875rem);`;
	}

	function getTableHeatClass(count: number): string {
		if (count === 0 || maxDailyCount === 0) return '';

		const ratio = count / maxDailyCount;
		if (ratio > 0.75) return 'bg-emerald-200 text-emerald-900';
		if (ratio > 0.5) return 'bg-emerald-100 text-emerald-800';
		if (ratio > 0.25) return 'bg-emerald-50 text-emerald-700';
		return 'bg-emerald-50/50 text-emerald-600';
	}

	function getHeatmapCellClass(count: number): string {
		if (count === 0 || maxDailyCount === 0) return 'border-slate-200 bg-slate-50';

		const ratio = count / maxDailyCount;
		if (ratio > 0.75) return 'border-emerald-600 bg-emerald-600';
		if (ratio > 0.5) return 'border-emerald-500 bg-emerald-500';
		if (ratio > 0.25) return 'border-emerald-300 bg-emerald-300';
		return 'border-emerald-100 bg-emerald-100';
	}

	function observerPath(observer: string): string {
		return withBase(`mobile-observations/observer?observer_id=${encodeURIComponent(observer)}`);
	}

	function sequenceVisualiserPath(observer: string): string {
		return `${SEQUENCE_VISUALISER_URL}/${encodeURIComponent(observer)}`;
	}

	function toggleSort(column: Exclude<SortColumn, null>) {
		if (sortColumn !== column) {
			sortColumn = column;
			sortDirection = 'asc';
			return;
		}

		if (sortDirection === 'asc') {
			sortDirection = 'desc';
			return;
		}

		sortColumn = null;
		sortDirection = 'desc';
	}

	function showActivityTooltip(
		event: FocusEvent | PointerEvent,
		activationCode: string,
		date: string,
		count: number
	) {
		if (!browser || !(event.currentTarget instanceof HTMLElement)) return;

		const rect = event.currentTarget.getBoundingClientRect();
		const tooltipWidth = 192;
		const viewportPadding = 12;
		const centeredLeft = rect.left + rect.width / 2;

		activityTooltip = {
			activationCode,
			date,
			count,
			left: Math.min(
				Math.max(centeredLeft, viewportPadding + tooltipWidth / 2),
				window.innerWidth - viewportPadding - tooltipWidth / 2
			),
			top: Math.max(rect.top - 8, viewportPadding)
		};
	}

	function hideActivityTooltip() {
		activityTooltip = null;
	}

	function formatCsvCell(value: string | number): string {
		const escaped = String(value).replaceAll('"', '""');
		return /[",\r\n]/.test(escaped) ? `"${escaped}"` : escaped;
	}

	function downloadActivityCsv() {
		if (!browser || activityRows.length === 0) return;

		const headers = ['Observer', 'Total', ...activityDates];
		const rows = activityRows.map((row) => [
			row.activationCode,
			row.total,
			...activityDates.map((date) => row.daily.get(date) ?? 0)
		]);
		const csv = [headers, ...rows]
			.map((row) => row.map((value) => formatCsvCell(value)).join(','))
			.join('\r\n');
		const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
		const link = document.createElement('a');

		link.href = url;
		link.download = 'observer-activity.csv';
		document.body.append(link);
		link.click();
		link.remove();
		URL.revokeObjectURL(url);
	}
</script>

<section class="w-full min-w-0 max-w-full space-y-3 py-3">
	<div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<h2 class="text-base font-semibold text-foreground">Observer Activity</h2>
			<p class="text-xs text-muted-foreground">
				{#if normalizedSearchQuery}
					{activityRows.length} of {allActivityRows.length} observers
				{:else}
					{activityRows.length} observer{activityRows.length === 1 ? '' : 's'}
				{/if}
				&middot;
				{activityDates.length} day{activityDates.length === 1 ? '' : 's'}
			</p>
		</div>
		<div class="flex flex-wrap items-center gap-2">
			<div class="relative min-w-56 flex-1 sm:w-64 sm:flex-none">
				<Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					bind:value={searchQuery}
					type="search"
					class="h-9 pl-9 shadow-none"
					placeholder="Search observer"
					aria-label="Search by observer"
					oninput={() => {
						observerPageStart = 0;
					}}
				/>
			</div>
			<Button
				type="button"
				variant="outline"
				size="sm"
				class="gap-1.5"
				disabled={activityRows.length === 0}
				onclick={downloadActivityCsv}
			>
				<DownloadIcon class="h-3.5 w-3.5" />
				Download Activity
			</Button>
			<div
				class="inline-flex w-fit rounded-lg border bg-muted/30 p-0.5"
				aria-label="Observer activity view"
			>
				<button
					type="button"
					class={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
						activityView === 'heatmap'
							? 'bg-card text-foreground shadow-sm'
							: 'text-muted-foreground hover:text-foreground'
					}`}
					aria-pressed={activityView === 'heatmap'}
					onclick={() => {
						activityView = 'heatmap';
					}}
				>
					<Grid3x3 class="h-3.5 w-3.5" />
					Heatmap
				</button>
				<button
					type="button"
					class={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
						activityView === 'table'
							? 'bg-card text-foreground shadow-sm'
							: 'text-muted-foreground hover:text-foreground'
					}`}
					aria-pressed={activityView === 'table'}
					onclick={() => {
						activityView = 'table';
					}}
				>
					<Table2 class="h-3.5 w-3.5" />
					Table
				</button>
			</div>
		</div>
	</div>

	{#if allActivityRows.length === 0}
		<div class="rounded-lg border border-dashed bg-muted/30 p-8 text-center">
			<Users class="mx-auto h-8 w-8 text-muted-foreground/40" />
			<p class="mt-2 text-sm font-medium text-foreground">No observer data</p>
			<p class="mt-1 text-xs text-muted-foreground">
				Observer activity will appear here once observations are available.
			</p>
		</div>
	{:else if activityRows.length === 0}
		<div class="rounded-lg border border-dashed bg-muted/30 p-8 text-center">
			<Search class="mx-auto h-8 w-8 text-muted-foreground/40" />
			<p class="mt-2 text-sm font-medium text-foreground">No matching observers</p>
			<p class="mt-1 text-xs text-muted-foreground">
				Try a different observation ID or activation code.
			</p>
		</div>
	{:else}
		<div class="min-w-0 max-w-full space-y-3">
			{#if activityView === 'heatmap'}
				<div class="min-w-0 max-w-full overflow-hidden rounded-lg border bg-card">
					<div class="w-full max-w-full overflow-x-auto py-3">
						<div class="min-w-max space-y-1">
							{#each visibleActivityRows as row (row.observer)}
								<div
									class="grid items-center gap-1 pr-3"
									style={getActivityGridStyle(activityDates.length)}
								>
									<a
										href={observerPath(row.observer)}
										class="sticky left-0 truncate rounded bg-card px-2 py-1 pl-3 text-left font-mono text-xs text-foreground underline-offset-2 hover:bg-muted hover:underline"
									>
										{row.activationCode}
										<span class="font-sans text-muted-foreground">
											({row.total})
										</span>
									</a>
									{#each activityDates as date (date)}
										{@const count = row.daily.get(date) ?? 0}
										<button
											type="button"
											class={`h-3.5 w-3.5 cursor-default rounded-[3px] border transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${getHeatmapCellClass(count)}`}
											aria-label={`${row.activationCode}, ${formatActivityFullDate(date)}, ${formatObservationCount(count)}`}
											onpointerenter={(event) =>
												showActivityTooltip(event, row.activationCode, date, count)}
											onpointerleave={hideActivityTooltip}
											onfocus={(event) =>
												showActivityTooltip(event, row.activationCode, date, count)}
											onblur={hideActivityTooltip}
										></button>
									{/each}
								</div>
							{/each}
							<div
								class="grid items-start gap-1 pt-1"
								style={getActivityGridStyle(activityDates.length)}
							>
								<div class="sticky left-0 z-10 bg-card px-2 pl-3 text-[10px] text-muted-foreground">
									Date
								</div>
								{#each activityDates as date (date)}
									<div class="relative h-7">
										{#if heatmapLabelDates.has(date)}
											<span
												class="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap text-[10px] text-muted-foreground"
											>
												{formatActivityDate(date)}
											</span>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					</div>
					{#if activityTooltip}
						<div
							class="pointer-events-none fixed z-50 w-48 -translate-x-1/2 -translate-y-full rounded-md border bg-popover px-2.5 py-2 text-left text-[11px] text-popover-foreground shadow-sm"
							style={`left: ${activityTooltip.left}px; top: ${activityTooltip.top}px;`}
						>
							<span class="block truncate font-mono text-foreground">
								{activityTooltip.activationCode}
							</span>
							<span class="mt-1 block text-muted-foreground">
								{formatActivityFullDate(activityTooltip.date)}
							</span>
							<span class="mt-1 block font-medium text-foreground">
								{formatObservationCount(activityTooltip.count)}
							</span>
						</div>
					{/if}
				</div>
			{:else}
				<div class="min-w-0 max-w-full overflow-hidden rounded-lg border">
					<Table class="min-w-max text-xs">
						<TableHeader>
							<TableRow class="bg-muted hover:bg-muted">
								<TableHead
									class="sticky left-0 top-0 z-20 bg-muted px-3 py-2 text-muted-foreground"
									aria-sort={sortColumn === 'activationCode'
										? sortDirection === 'asc'
											? 'ascending'
											: 'descending'
										: 'none'}
								>
									<button
										type="button"
										class="inline-flex cursor-pointer items-center gap-1 hover:text-foreground"
										onclick={() => toggleSort('activationCode')}
									>
										Observer
										{#if sortColumn === 'activationCode'}
											{#if sortDirection === 'asc'}
												<ArrowUp class="h-3 w-3" />
											{:else}
												<ArrowDown class="h-3 w-3" />
											{/if}
										{/if}
									</button>
								</TableHead>
								<TableHead
									class="sticky top-0 z-20 min-w-32 bg-muted px-3 py-2 text-muted-foreground"
								>
									Sequence Visualiser
								</TableHead>
								<TableHead
									class="sticky top-0 z-20 bg-muted px-3 py-2 text-right text-muted-foreground"
									aria-sort={sortColumn === 'total'
										? sortDirection === 'asc'
											? 'ascending'
											: 'descending'
										: 'none'}
								>
									<button
										type="button"
										class="inline-flex w-full cursor-pointer items-center justify-end gap-1 hover:text-foreground"
										onclick={() => toggleSort('total')}
									>
										Total
										{#if sortColumn === 'total'}
											{#if sortDirection === 'asc'}
												<ArrowUp class="h-3 w-3" />
											{:else}
												<ArrowDown class="h-3 w-3" />
											{/if}
										{/if}
									</button>
								</TableHead>
								{#each activityDates as date (date)}
									<TableHead
										class="sticky top-0 z-20 min-w-14 bg-muted px-2 py-2 text-center text-muted-foreground"
										aria-sort={sortColumn === `date:${date}`
											? sortDirection === 'asc'
												? 'ascending'
												: 'descending'
											: 'none'}
									>
										<button
											type="button"
											class="inline-flex w-full cursor-pointer flex-col items-center justify-center hover:text-foreground"
											onclick={() => toggleSort(`date:${date}`)}
										>
											<span class="inline-flex items-center gap-1">
												{formatActivityDate(date)}
												{#if sortColumn === `date:${date}`}
													{#if sortDirection === 'asc'}
														<ArrowUp class="h-3 w-3" />
													{:else}
														<ArrowDown class="h-3 w-3" />
													{/if}
												{/if}
											</span>
										</button>
										<div class="text-[9px] font-normal text-muted-foreground/60">
											{formatActivityWeekday(date)}
										</div>
									</TableHead>
								{/each}
							</TableRow>
						</TableHeader>
						<TableBody>
							{#each visibleActivityRows as row (row.observer)}
								<TableRow>
									<TableCell class="sticky left-0 z-10 bg-card px-3 py-2">
										<a
											href={observerPath(row.observer)}
											class="font-mono text-foreground underline-offset-2 hover:underline"
										>
											{row.activationCode}
										</a>
									</TableCell>
									<TableCell class="px-3 py-2">
										<a
											href={sequenceVisualiserPath(row.observer)}
											target="_blank"
											rel="noopener noreferrer"
											class="inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline"
										>
											Visit
											<ExternalLink class="h-3 w-3" />
										</a>
									</TableCell>
									<TableCell class="px-3 py-2 text-right font-medium tabular-nums text-foreground">
										{row.total}
									</TableCell>
									{#each activityDates as date (date)}
										{@const count = row.daily.get(date) ?? 0}
										<TableCell
											class={`px-2 py-2 text-center tabular-nums ${getTableHeatClass(count)}`}
										>
											{count > 0 ? count : ''}
										</TableCell>
									{/each}
								</TableRow>
							{/each}
						</TableBody>
					</Table>
				</div>
			{/if}

			<div class="flex flex-wrap items-center justify-between gap-2">
				<div class="flex items-center gap-2">
					<Info class="size-3 text-muted-foreground" />
					<p class="text-[11px] text-muted-foreground">
						Select an activation code to view that observer's observations.
						{#if activityView === 'heatmap'}
							Darker squares indicate more observations on that day.
						{/if}
					</p>
				</div>
				{#if activityRows.length > OBSERVERS_PER_PAGE}
					<div class="flex items-center justify-end gap-1">
						<Button
							type="button"
							variant="ghost"
							size="icon"
							class="h-7 w-7"
							disabled={!hasPreviousObserverPage}
							aria-label="Previous observers"
							onclick={() => {
								observerPageStart = Math.max(0, observerPageOffset - OBSERVERS_PER_PAGE);
							}}
						>
							<ChevronLeft class="h-3.5 w-3.5" />
						</Button>
						<span class="text-[10px] tabular-nums text-muted-foreground">
							{observerPageOffset + 1}&ndash;{Math.min(
								observerPageOffset + OBSERVERS_PER_PAGE,
								activityRows.length
							)}
							of {activityRows.length} observers
						</span>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							class="h-7 w-7"
							disabled={!hasNextObserverPage}
							aria-label="Next observers"
							onclick={() => {
								observerPageStart = observerPageOffset + OBSERVERS_PER_PAGE;
							}}
						>
							<ChevronRight class="h-3.5 w-3.5" />
						</Button>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</section>
