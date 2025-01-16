<script lang="ts">
	import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
	import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
	import type { DateRange } from 'bits-ui';
	import { dateToCalendarDate } from '$lib/api/session/ads/utils';
	import type { BasicAdData } from '$lib/api/session/ads/types';
	import ObservationsTimeline from './components/observations-timeline.svelte';
	import ObserversTable from './components/observers-table.svelte';
	import Filters from './components/filters.svelte';
	import AdsBrowser from './components/ads-browser.svelte';
	import { guestSessions } from '$lib/api/auth/guest-sessions.svelte';
	import { Button } from '$lib/components/ui/button';
	import { withBase } from '$lib/utils';
	import Timer from '$lib/components/timer.svelte';
	import { getLocalTimeZone } from '@internationalized/date';
	import { Hourglass, Square } from 'lucide-svelte';
	import { scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	let {
		ads = $bindable()
	}: {
		ads: BasicAdData[];
	} = $props();

	const computeDateRange = (days: number = -1) => {
		// If days = -1, show all time
		const today = new Date();
		if (days === -1) {
			const firstAd = ads.at(-1);
			const lastAd = ads.at(0);
			if (!firstAd || !lastAd)
				return {
					start: dateToCalendarDate(today),
					end: dateToCalendarDate(today)
				};
			return {
				start: dateToCalendarDate(new Date(firstAd.timestamp)),
				end: dateToCalendarDate(new Date(lastAd.timestamp))
			};
		}

		const startDate = new Date(today.getTime() - 1000 * 60 * 60 * 24 * days);
		return {
			start: dateToCalendarDate(startDate),
			end: dateToCalendarDate(today)
		};
	};

	let dateRange = $state<DateRange>(computeDateRange());
</script>

{#if guestSessions.sessions.length > 0}
	<div out:scale={{ duration: 300 }} class="flex flex-col gap-4">
		<h1>Guest Sessions</h1>
		The data for the following observers are currently publicly accessible. Press "Deactivate Now" to
		disable the session for an observer.

		<div class="flex flex-wrap gap-4">
			{#each guestSessions.sessions as { key, data } (key)}
				<div
					class="flex max-w-[46ch] flex-col gap-2 rounded-lg border p-4 text-card-foreground shadow-md dark:shadow-zinc-800"
					transition:scale
					animate:flip={{ duration: 300 }}
				>
					{#if key}
						{@const observerId = key.replace('mobile-observer-', '')}
						<h2 class="font-mono text-lg font-bold">
							<a href={withBase(`mobile-observations/observer?observer_id=${observerId}`)}
								>{observerId}</a
							>
						</h2>
						{#if data && data.description}
							<div class="w-full whitespace-pre-wrap text-wrap">
								{@html data.description}
							</div>
						{/if}
						{#if data && data.exp}
							<p>
								Available until {new Date(data.exp * 1000).toLocaleString('en-GB', {
									hour12: true,
									timeZone: getLocalTimeZone(),
									timeZoneName: 'short',
									month: 'short',
									day: '2-digit',
									hour: '2-digit',
									minute: '2-digit',
									second: '2-digit'
								})}
							</p>
						{/if}
						<div class="flex items-center justify-between">
							{#if data && data.exp}
								<div class="flex items-center gap-1 text-sm">
									<Hourglass />
									<Timer exp={data.exp * 1000} onExpire={guestSessions.sync} />
								</div>
							{/if}
							<Button
								variant="destructive"
								onclick={() => {
									guestSessions.delete(key);
								}}
							>
								<Square />
								Deactivate Now
							</Button>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{/if}

<div class="flex flex-col gap-4">
	<h1>Observations Timeline</h1>

	The timeline below shows the number of observations identified as ads over time.

	<ObservationsTimeline {ads} {dateRange} />
</div>

<div class="flex flex-col gap-4">
	<h1>Observers</h1>

	The table below shows the number of ads each observer has seen on each day. Click on the
	observer's ID to view all the ads collected by that observer.

	<ObserversTable {ads} {dateRange} />
</div>

<div class="flex flex-col gap-4">
	<h1>Ads Browser</h1>

	Expand each date to see the ads that were observed on that day by all observers.

	<AdsBrowser bind:ads {dateRange} />
</div>

<Filters {ads} bind:dateRange />
