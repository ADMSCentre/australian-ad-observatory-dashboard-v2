<script lang="ts">
	import { withBase } from '$lib/utils';
	import { CalendarDaysIcon, Database, Hourglass, User } from 'lucide-svelte';
	import type { RichAdData } from '$lib/api/session/ads/types';
	import { session } from '$lib/api/session/session.svelte';

	const ads = $derived(session.ads.getAll());

	const summarise = (ads: RichAdData[]) => {
		// Number of ads in the last 24 hours
		const last24HourTimestamp = Date.now() - 24 * 60 * 60 * 1000;
		const last24HourAds = ads.filter((ad) => ad.timestamp > last24HourTimestamp);

		// Number of observers
		const observers = new Set(ads.map((ad) => ad.observer));

		const formatDate = (timestamp: number) =>
			new Date(timestamp).toLocaleDateString('en-GB', {
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			});

		if (ads.length === 0) {
			return null;
		}

		return {
			count: ads.length,
			period: {
				start: formatDate(ads[ads.length - 1].timestamp),
				end: formatDate(ads[0].timestamp)
			},
			observersCount: observers.size,
			recentCount: last24HourAds.length
		};
	};
</script>

<div class="flex flex-col gap-4">
	<h1>Welcome to the Australian Ad Observatory Version 2</h1>
	<p>
		This dashboard supports the <a
			class="text-blue-500 hover:underline"
			rel="noopener noreferrer"
			target="_blank"
			href="https://www.admscentre.org.au/adobservatory/"
		>
			Australian Ad Observatory
		</a> project by the Australian Research Council Centre of Excellence for Automated Decision-Making
		and Society.
	</p>

	<section class="flex flex-col gap-2">
		<h2>Data Sources</h2>
		<p class="text-sm text-zinc-500">
			Select a data source below to view the data collected by the Australian Ad Observatory.
		</p>
		<a
			href={withBase('mobile-observations')}
			class="grid size-56 grid-rows-[80%_20%] overflow-hidden rounded-sm border bg-gradient-to-br from-zinc-200 to-zinc-50 hover:shadow-md dark:from-zinc-900 dark:to-zinc-800 dark:shadow-zinc-700"
		>
			<div class="relative">
				<img
					src="https://play-lh.googleusercontent.com/uKhYzGbCoKMMNm7omMVmWTVsiuN4NMN0qVHUgbR32-dnQsOfjdUqDbLkYqJVcKsrkEI=w240-h480-rw"
					alt="Mobile Ads Observatory"
					class="absolute size-full object-cover opacity-50"
				/>
				{#await ads then ads}
					{@const summary = summarise(ads)}
					{#if summary !== null}
						<div
							class="summary absolute bottom-0 flex flex-wrap items-end gap-2 p-2 text-xs font-medium"
						>
							<span class="summary-tag">
								<User size={14} />
								{summary.observersCount}
							</span>
							<span class="summary-tag">
								<Database size={14} />
								{summary.count} ads
							</span>
							<span class="summary-tag">
								{summary.recentCount} last 24h
							</span>

							<span class="summary-tag">
								<CalendarDaysIcon size={14} />
								{summary.period.start} - {summary.period.end}
							</span>
						</div>
					{/if}
				{/await}
			</div>
			<div class="p-2 font-bold">Mobile Ads Observatory</div>
		</a>
	</section>
</div>

<style>
	.summary-tag {
		@apply flex items-center gap-1 rounded-lg border bg-opacity-50 px-1 py-0.5 backdrop-blur;
	}
	/* Color palette */
	.summary-tag {
		&:nth-child(1) {
			@apply border-yellow-500 bg-yellow-100;
		}
		&:nth-child(2) {
			@apply border-red-500 bg-red-100;
		}
		&:nth-child(3) {
			@apply border-green-500 bg-green-100;
		}
		&:nth-child(4) {
			@apply border-blue-500 bg-blue-100;
		}
		&:nth-child(5) {
			@apply border-purple-500 bg-purple-100;
		}
		&:nth-child(6) {
			@apply border-indigo-500 bg-indigo-100;
		}
		&:nth-child(7) {
			@apply border-pink-500 bg-pink-100;
		}
		&:nth-child(8) {
			@apply border-cyan-500 bg-cyan-100;
		}
	}
	/* dark color palette */
	:global(.dark) {
		.summary-tag {
			&:nth-child(1) {
				@apply bg-yellow-950;
			}
			&:nth-child(2) {
				@apply bg-red-950;
			}
			&:nth-child(3) {
				@apply bg-green-950;
			}
			&:nth-child(4) {
				@apply bg-blue-950;
			}
			&:nth-child(5) {
				@apply bg-purple-950;
			}
			&:nth-child(6) {
				@apply bg-indigo-950;
			}
			&:nth-child(7) {
				@apply bg-pink-950;
			}
			&:nth-child(8) {
				@apply bg-cyan-950;
			}
		}
	}
</style>
