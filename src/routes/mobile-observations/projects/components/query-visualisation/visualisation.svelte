<script lang="ts">
	import type { RichAdData } from '$lib/api/session/ads/types';
	import Accordion from '$lib/components/accordion/accordion.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { json } from '@codemirror/lang-json';
	import { CheckIcon, ChevronRightIcon, XIcon } from 'lucide-svelte';
	import AdsBrowser from 'mobile-observations/components/ads-browser.svelte';
	import ObservationsTimeline from 'mobile-observations/components/observations-timeline.svelte';
	import ObserversTable from 'mobile-observations/components/observers-table.svelte';
	import { VISUALISATION_TYPES, type QueryResultConfig } from 'mobile-observations/projects/types';
	import CodeMirror from 'svelte-codemirror-editor';
	import { twMerge } from 'tailwind-merge';

	let {
		type,
		ads,
		config = $bindable(),
		allowDelete = true,
		onDelete = null,
		includeObservers = [],
		showHeader = true
	}: {
		type: (typeof VISUALISATION_TYPES)[number];
		ads: RichAdData[];
		config: QueryResultConfig;
		allowDelete?: boolean;
		onDelete?: (() => void) | null;
		includeObservers?: string[];
		showHeader?: boolean;
	} = $props();

	let isDeleting = $state(false);
	let reactiveAds = $state<RichAdData[]>([]);

	$effect(() => {
		if (config?.open === undefined) {
			config.open = true;
		}
	});

	$effect(() => {
		if (ads) {
			reactiveAds = ads;
		}
	});

	const labels: Record<(typeof VISUALISATION_TYPES)[number], string> = {
		timeline: 'Timeline',
		'observer-table': 'Observer Table',
		'ads-browser': 'Ads Browser',
		raw: 'Raw JSON'
	};

	function shouldShowVisualisation(type: (typeof VISUALISATION_TYPES)[number], ads: RichAdData[]) {
		if (type === 'timeline') {
			return ads.length > 0;
		}
		if (type === 'observer-table') {
			return true;
		}
		if (type === 'ads-browser') {
			return ads.length > 0;
		}
		if (type === 'raw') {
			return ads.length > 0;
		}
		return false;
	}
</script>

{#snippet visualisationContent()}
	{#if shouldShowVisualisation(type, ads)}
		{#if type === 'timeline'}
			<ObservationsTimeline {ads} />
		{/if}

		{#if type === 'observer-table'}
			<ObserversTable {ads} {includeObservers} />
		{/if}

		{#if type === 'ads-browser'}
			<AdsBrowser bind:ads={reactiveAds} syncQueryParams={false} open={false} />
		{/if}

		{#if type === 'raw'}
			<CodeMirror
				value={JSON.stringify(ads, null, 2)}
				readonly
				lang={json()}
				class="w-full overflow-hidden rounded-xl bg-muted/30"
				lineWrapping
				useTab={false}
			/>
		{/if}
	{:else}
		<div class="flex h-24 items-center justify-center rounded-xl bg-muted/30">
			<span class="text-sm text-muted-foreground">No data available for this visualisation.</span>
		</div>
	{/if}
{/snippet}

<div class="group/visualisation relative rounded-xl">
	{#if allowDelete}
		<div class="absolute right-2 top-2 z-10">
			{#if !isDeleting}
				<Button
					class="size-7 opacity-0 transition-opacity duration-200 group-hover/visualisation:opacity-100"
					variant="destructive"
					size="icon"
					aria-label="Delete visualisation"
					onclick={() => {
						isDeleting = true;
					}}
				>
					<XIcon class="size-4" />
				</Button>
			{:else}
				<div
					class="flex items-center gap-1 rounded-lg bg-background p-1 text-xs text-muted-foreground shadow-sm"
				>
					<span class="px-1">Delete?</span>
					<Button
						variant="ghost"
						size="icon"
						class="size-7"
						aria-label="Cancel delete visualisation"
						onclick={() => {
							isDeleting = false;
						}}
					>
						<XIcon class="size-4" />
					</Button>
					<Button
						class="size-7"
						variant="destructive"
						size="icon"
						aria-label="Confirm delete visualisation"
						onclick={() => {
							isDeleting = false;
							if (onDelete) onDelete();
						}}
					>
						<CheckIcon class="size-4" />
					</Button>
				</div>
			{/if}
		</div>
	{/if}

	{#if showHeader}
		<Accordion bind:open={config.open as boolean}>
			{#snippet summary(open)}
				<div class="flex w-full items-center justify-between border-b border-border pb-2 text-sm">
					<span class="inline-flex items-center gap-2 font-medium text-foreground">
						<ChevronRightIcon
							class={twMerge(
								'size-4 text-muted-foreground transition',
								open ? 'rotate-90 transform' : ''
							)}
						/>
						<span>{labels[type]}</span>
					</span>
				</div>
			{/snippet}
			{@render visualisationContent()}
		</Accordion>
	{:else}
		{@render visualisationContent()}
	{/if}
</div>
