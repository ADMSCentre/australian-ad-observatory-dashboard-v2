<script lang="ts">
	import type { RichAdData } from '$lib/api/session/ads/types';
	import Accordion from '$lib/components/accordion/accordion.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { json } from '@codemirror/lang-json';
	import { CheckIcon, ChevronDownIcon, ChevronRightIcon, XIcon } from 'lucide-svelte';
	import AdsBrowser from 'mobile-observations/components/ads-browser.svelte';
	import ObservationsTimeline from 'mobile-observations/components/observations-timeline.svelte';
	import ObserversTable from 'mobile-observations/components/observers-table.svelte';
	import { VISUALISATION_TYPES, type QueryResultConfig } from 'mobile-observations/projects/types';
	import { untrack } from 'svelte';
	import CodeMirror from 'svelte-codemirror-editor';
	import { twMerge } from 'tailwind-merge';

	let {
		type,
		ads,
		config = $bindable(),
		allowDelete = true,
		onDelete = null,
		includeObservers = []
	}: {
		type: (typeof VISUALISATION_TYPES)[number];
		ads: RichAdData[];
		config: QueryResultConfig;
		allowDelete?: boolean;
		onDelete?: (() => void) | null;
		includeObservers?: string[];
	} = $props();

	let isDeleting = $state(false);
	let reactiveAds = $state<RichAdData[]>(ads);

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
</script>

<div class="group/visualisation relative">
	{#if allowDelete}
		<div class="absolute right-1 top-1 z-10">
			{#if !isDeleting}
				<Button
					class="size-fit p-0.5 opacity-5 transition-opacity group-hover/visualisation:opacity-100"
					variant="destructive"
					onclick={() => {
						isDeleting = true;
					}}
				>
					<XIcon />
				</Button>
			{:else}
				<div
					class="flex items-center gap-1 rounded bg-muted text-xs font-light text-muted-foreground"
				>
					<span> Delete this visualisation? </span>
					<Button
						variant="ghost"
						class="size-fit p-0.5 opacity-25 transition-opacity group-hover/visualisation:opacity-100"
						onclick={() => {
							isDeleting = false;
						}}
					>
						<XIcon />
					</Button>
					<Button
						class="size-fit p-0.5 opacity-25 transition-opacity group-hover/visualisation:opacity-100"
						variant="destructive"
						onclick={() => {
							isDeleting = false;
							if (onDelete) onDelete();
						}}
					>
						<CheckIcon />
					</Button>
				</div>
			{/if}
		</div>
	{/if}

	{#if ads.length > 0}
		<Accordion bind:open={config.open as boolean}>
			{#snippet summary(open)}
				<div class="flex w-full items-center justify-between pb-2 text-sm font-light">
					<span class="inline-flex items-center gap-1 text-muted-foreground">
						<ChevronRightIcon
							class={twMerge('size-3 transition', open ? 'rotate-90 transform' : '')}
						/>
						<span class=" underline">{labels[type]}</span>
					</span>
				</div>
			{/snippet}

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
					class="w-full"
					lineWrapping
					useTab={false}
				/>
			{/if}
		</Accordion>
	{/if}
</div>
