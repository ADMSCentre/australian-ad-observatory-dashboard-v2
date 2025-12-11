<script lang="ts">
	import { auth } from '$lib/api/auth/auth.svelte';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import Codemirror from 'svelte-codemirror-editor';
	import { json } from '@codemirror/lang-json';

	import { fetchRichDataObject } from '$lib/api/session/ads/utils';
	import AdCardBody from '../ad-card/ad-card-body.svelte';
	import OcrView from './ocr-view.svelte';
	import CandidatesView from './candidates-view.svelte';
	import type {
		MediaSource,
		Ranking,
		RichDataObject
	} from '$lib/api/session/ads/rich-data-object-type';
	import type { RichAdData } from '$lib/api/session/ads/types';
	import { session } from '$lib/api/session/session.svelte';
	import Table from './table.svelte';
	import { untrack } from 'svelte';
	import { attachRichDataObject } from '$lib/api/session/ads/rdo-helper';

	let {
		richViewExpanded = $bindable(false),
		currentAd = $bindable()
	}: {
		richViewExpanded: boolean;
		currentAd: RichAdData | null;
	} = $props();

	$effect(() => {
		if (!currentAd) return;
		untrack(() => {
			session.ads.enrich(currentAd, ['richDataObject', 'metaLibraryScrape']);
		});
	});

	const keyframes = $derived.by(() => {
		if (!currentAd || !currentAd.richDataObject) return null;
		return currentAd.richDataObject.observation.keyframes;
	});
	const adDimension = $derived.by(() => {
		if (!currentAd || !currentAd.richDataObject) return null;
		return currentAd.richDataObject.observation.ad_dimensions;
	});
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
		const rdoMetaAdLibraryCandidates =
			currentAd.richDataObject.enrichment.meta_adlibrary_scrape.candidates;
		if (rdoMetaAdLibraryCandidates && rdoMetaAdLibraryCandidates.length > 0)
			return rdoMetaAdLibraryCandidates;
		const cclCandidates = (currentAd.richDataObject.enrichment as any).ccl?.scrapes?.[0]?.response
			?.response_interpreted?.json_raw;
		if (cclCandidates && cclCandidates.length > 0)
			return cclCandidates.map((value: any) => ({
				data: value
			}));
		return [];
	});
	// const candidates = $derived(
	// 	(currentAd?.metaLibraryScrape?.candidates.map((c, index) => {
	// 		return {
	// 			ad_library_scrape_candidates_i: index,
	// 			data: c
	// 		};
	// 	}) as RichDataObject['enrichment']['meta_adlibrary_scrape']['candidates']) || null
	// );
	// const rankings = $derived.by(() => {
	// 	if (!currentAd || !currentAd.richDataObject) return null;
	// 	return currentAd.richDataObject.enrichment.meta_adlibrary_scrape.rankings;
	// });
	const rankings = $derived((currentAd?.metaLibraryScrape?.rankings as Ranking[]) || null);
	// const mediaMapping = $derived.by(() => {
	// 	if (!currentAd || !currentAd.richDataObject) return null;
	// 	const scrapeReference =
	// 		currentAd.richDataObject.enrichment.meta_adlibrary_scrape.reference.scrape;

	// 	const scrapeSources = {
	// 		...currentAd.richDataObject.enrichment.meta_adlibrary_scrape.comparisons.image
	// 			.ad_scrape_sources,
	// 		...currentAd.richDataObject.enrichment.meta_adlibrary_scrape.comparisons.video
	// 			.ad_scrape_sources
	// 	};
	// 	return Object.entries(scrapeSources).reduce(
	// 		(acc, [path, mediaObj]: [string, any]) => {
	// 			const mediaUrl = mediaObj.media_url;
	// 			const fullPath = `${scrapeReference.observer_uuid}/meta_adlibrary_scrape/${scrapeReference.tentative_ad}/${path}`;
	// 			acc[mediaUrl] = { filename: path, fullPath };
	// 			return acc;
	// 		},
	// 		{} as Record<string, { filename: string; fullPath: string }>
	// 	);
	// });

	// Creates a mapping from the original URL to the S3 path for the media files
	const mediaMapping = $derived.by(() => {
		if (
			!currentAd ||
			(!currentAd.metaLibraryScrape?.mediaPaths && !currentAd.richDataObject?.enrichment?.media)
		)
			return null;
		const observerId = currentAd.observer;
		const observationId = `${currentAd.timestamp}.${currentAd.adId}`;

		const mapping = {
			...Object.entries(currentAd?.metaLibraryScrape?.mediaPaths || {}).reduce(
				(acc, [originalUrl, path]: [string, string]) => {
					const fullPath = `${observerId}/meta_adlibrary_scrape/${observationId}/${path}`;
					acc[originalUrl] = { filename: path, fullPath };
					return acc;
				},
				{} as Record<string, { filename: string; fullPath: string }>
			),
			...Object.entries(currentAd?.richDataObject?.enrichment.media || {}).reduce(
				(acc, [originalUrl, path]: [string, string]) => {
					const filename = path.split('/').pop() || path;
					acc[originalUrl] = { filename, fullPath: path.replaceAll('//', '/') };
					return acc;
				},
				{} as Record<string, { filename: string; fullPath: string }>
			)
		};
		return mapping;
	});
</script>

{#if currentAd}
	{#snippet richDataJson()}
		{#if currentAd.richDataObject}
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
					<Tabs.Trigger value="classifications">Classifications</Tabs.Trigger>
					<Tabs.Trigger value="rich-data-table">Table</Tabs.Trigger>
					{#if !auth.isGuest}
						<Tabs.Trigger value="rich-data">JSON</Tabs.Trigger>
					{/if}
				</Tabs.List>
				<Tabs.Content value="captured-ad">
					<div class="flex flex-col gap-2 md:flex-row">
						<AdCardBody adData={currentAd} class="max-w-96" />
					</div>
				</Tabs.Content>
				<Tabs.Content value="ocr-data">
					{#if keyframes && adDimension && observationId && observerId}
						<OcrView
							keyframes={keyframes as any}
							{adDimension}
							observationId={`${currentAd.timestamp}.${currentAd.adId}`}
							observerId={currentAd.observer}
						/>
					{/if}
				</Tabs.Content>
				<Tabs.Content value="candidate-ads">
					{#if candidates && rankings && mediaMapping}
						<CandidatesView {candidates} {rankings} {mediaMapping} />
					{/if}
				</Tabs.Content>
				<Tabs.Content value="classifications">
					{#if currentAd.classifications && currentAd.classifications.length > 0}
						<div class="flex flex-col gap-4 p-4">
							<h3 class="text-lg font-semibold">Classification Results</h3>
							<p class="text-sm text-muted-foreground">
								The following classifications were detected for this ad, sorted by confidence score.
							</p>
							<div class="grid gap-3">
								{#each currentAd.classifications.toSorted((a, b) => b.score - a.score) as classification}
									<div class="flex items-center justify-between rounded-lg border p-3">
										<span class="font-medium">{classification.label}</span>
										<div class="flex items-center gap-3">
											<div
												class="h-2 w-32 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700"
											>
												<div
													class="h-full rounded-full transition-all"
													class:bg-green-500={classification.score >= 0.7}
													class:bg-yellow-500={classification.score >= 0.5 &&
														classification.score < 0.7}
													class:bg-red-500={classification.score < 0.5}
													style="width: {classification.score * 100}%"
												></div>
											</div>
											<span class="w-16 text-right text-sm text-muted-foreground">
												{(classification.score * 100).toFixed(1)}%
											</span>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{:else}
						<div class="flex items-center justify-center p-8 text-muted-foreground">
							<p>No classification data available for this ad.</p>
						</div>
					{/if}
				</Tabs.Content>
				<Tabs.Content value="rich-data-table">
					{#if currentAd.richDataObject}
						<Table richDataObject={attachRichDataObject(currentAd)} />
					{/if}
				</Tabs.Content>
				<Tabs.Content value="rich-data">
					{@render richDataJson()}
				</Tabs.Content>
			</Tabs.Root>
		</Sheet.Content>
	</Sheet.Root>
{/if}
