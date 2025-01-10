<script lang="ts">
	import { auth } from '$lib/api/auth.svelte';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import Codemirror from 'svelte-codemirror-editor';
	import { json } from '@codemirror/lang-json';

	import type { RichAdData } from '../../types';
	import { fetchRichDataObject } from '../../utils';
	import AdCardBody from '../ad-card-body.svelte';
	import OcrView from './ocr-view.svelte';
	import CandidatesView from './candidates-view.svelte';
	import type { MediaSource } from '../../rich-data-object-type';

	let {
		richViewExpanded = $bindable(false),
		currentAd = $bindable()
	}: {
		richViewExpanded: boolean;
		currentAd: RichAdData | null;
	} = $props();

	$effect(() => {
		(async () => {
			if (!currentAd || !auth.token) return;
			currentAd.richDataObject = await fetchRichDataObject(currentAd, auth.token);
		})();
	});

	const keyframes = $derived(currentAd?.richDataObject?.observation.keyframes || null);
	const adDimension = $derived(currentAd?.richDataObject?.observation.ad_dimensions || null);
	// const imagePath = $derived.by(() => {
	// 	if (!currentAd || !currentAd.richDataObject) return null;
	// 	return `${currentAd?.richDataObject.observer.uuid}/tempt/${currentAd?.richDataObject.observation.uuid}/`;
	// });
	const observationId = $derived.by(() => {
		if (!currentAd || !currentAd.richDataObject) return null;
		return currentAd.richDataObject.observation.uuid;
	});
	const observerId = $derived.by(() => {
		if (!currentAd || !currentAd.richDataObject) return null;
		return currentAd.richDataObject.observer.uuid;
	});
	const candidates = $derived.by(() => {
		if (!currentAd || !currentAd.richDataObject) return null;
		return currentAd.richDataObject.enrichment.meta_adlibrary_scrape.candidates;
	});
	const rankings = $derived.by(() => {
		if (!currentAd || !currentAd.richDataObject) return null;
		return currentAd.richDataObject.enrichment.meta_adlibrary_scrape.rankings;
	});
	const mediaMapping = $derived.by(() => {
		if (!currentAd || !currentAd.richDataObject) return null;
		const scrapeReference =
			currentAd.richDataObject.enrichment.meta_adlibrary_scrape.reference.scrape;

		const scrapeSources = {
			...currentAd.richDataObject.enrichment.meta_adlibrary_scrape.comparisons.image
				.ad_scrape_sources,
			...currentAd.richDataObject.enrichment.meta_adlibrary_scrape.comparisons.video
				.ad_scrape_sources
		};
		return Object.entries(scrapeSources).reduce(
			(acc, [path, mediaObj]) => {
				const mediaUrl = mediaObj.media_url;
				const fullPath = `${scrapeReference.observer_uuid}/meta_adlibrary_scrape/${scrapeReference.tentative_ad}/${path}`;
				acc[mediaUrl] = { ...mediaObj, filename: path, fullPath };
				return acc;
			},
			{} as Record<string, MediaSource & { filename: string; fullPath: string }>
		);
	});
</script>

{#if currentAd}
	{#snippet stitchedAd()}
		<div>
			<p class="text-xs">Ad-only view - only the ad content is shown.</p>
			<AdCardBody adData={currentAd} class="max-w-96" framesMode={'stitched'} />
		</div>
	{/snippet}

	{#snippet originalAd()}
		<div>
			<p class="text-xs">Original view - the original recording is shown.</p>
			<AdCardBody adData={currentAd} class="max-w-96" framesMode="raw" />
		</div>
	{/snippet}

	{#snippet richDataJson()}
		{#if currentAd.richDataObject}
			<strong>
				NOTE: The rich data object shown here is mocked and does not represent the actual data.
			</strong>
			<Codemirror
				class=" max-h-[75vh] overflow-auto text-left"
				lang={json()}
				lineWrapping
				value={JSON.stringify(currentAd, null, 2)}
				readonly
			/>
		{:else}
			<p>Loading...</p>
		{/if}
	{/snippet}

	<Sheet.Root
		open={richViewExpanded}
		onOpenChange={(open) => {
			richViewExpanded = open;
		}}
	>
		<Sheet.Content class="min-w-[100vw] overflow-y-scroll sm:min-w-[60vw]">
			<Sheet.Header>
				<Sheet.Title>Rich Ad Data View</Sheet.Title>
				<Sheet.Description>
					This view shows the Rich Data Object for the current ad.
				</Sheet.Description>
			</Sheet.Header>
			<Tabs.Root value="ocr-data">
				<Tabs.List>
					{#if !auth.isGuest}
						<Tabs.Trigger value="captured-ad">Capture</Tabs.Trigger>
					{/if}
					<Tabs.Trigger value="ocr-data">OCR</Tabs.Trigger>
					<Tabs.Trigger value="candidate-ads">Candidates</Tabs.Trigger>
					{#if !auth.isGuest}
						<Tabs.Trigger value="rich-data">JSON</Tabs.Trigger>
					{/if}
				</Tabs.List>
				<Tabs.Content value="captured-ad">
					<div class="flex flex-col gap-2 md:flex-row">
						{@render originalAd()}
						{@render stitchedAd()}
					</div>
				</Tabs.Content>
				<Tabs.Content value="ocr-data">
					{#if keyframes && adDimension && observationId && observerId}
						<OcrView {keyframes} {adDimension} {observationId} {observerId} />
					{/if}
				</Tabs.Content>
				<Tabs.Content value="candidate-ads">
					{#if candidates && rankings && mediaMapping}
						<CandidatesView {candidates} {rankings} {mediaMapping} />
					{/if}
				</Tabs.Content>
				<Tabs.Content value="rich-data">
					{@render richDataJson()}
				</Tabs.Content>
			</Tabs.Root>
		</Sheet.Content>
	</Sheet.Root>
{/if}
