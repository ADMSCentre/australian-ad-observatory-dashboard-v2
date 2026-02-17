<script lang="ts">
	import { auth } from '$lib/api/auth/auth.svelte';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import Codemirror from 'svelte-codemirror-editor';
	import { json } from '@codemirror/lang-json';

	import AdCardBody from '../ad-card/ad-card-body.svelte';
	import OcrView from './ocr-view.svelte';
	import CclSnapshotsView from './ccl-snapshots-view.svelte';
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
					{#if !auth.isGuest}
						<Tabs.Trigger value="ccl">CCL</Tabs.Trigger>
					{/if}
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
				<Tabs.Content value="ccl">
					{#if observationId}
						<CclSnapshotsView {observationId} />
					{:else}
						<div class="flex items-center justify-center p-8 text-muted-foreground">
							<p>Observation ID not available.</p>
						</div>
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
