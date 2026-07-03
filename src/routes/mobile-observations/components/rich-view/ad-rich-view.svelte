<script lang="ts">
	import { json } from '@codemirror/lang-json';
	import Codemirror from 'svelte-codemirror-editor';
	import { untrack } from 'svelte';
	import {
		Braces,
		ChevronDown,
		ChevronRight,
		Eye,
		EyeOff,
		Info,
		Library,
		ScanText,
		Star,
		Table2,
		TagsIcon
	} from 'lucide-svelte';
	import { twMerge } from 'tailwind-merge';

	import { auth } from '$lib/api/auth/auth.svelte';
	import { client } from '$lib/api/client';
	import { session } from '$lib/api/session/session.svelte';
	import type { ExpandType, RichAdData } from '$lib/api/session/ads/types';
	import type { RichDataObject } from '$lib/api/session/ads/rich-data-object-type';
	import { attachRichDataObject } from '$lib/api/session/ads/rdo-helper';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { withBase } from '$lib/utils';

	import AdPlaybackControls from '../ad-card/ad-playback-controls.svelte';
	import { PlaybackController } from '../ad-card/playback-controller.svelte';
	import TagsSelector from '../ad-card/tags-selector.svelte';
	import CclSnapshotsView from './ccl-snapshots-view.svelte';
	import Table from './table.svelte';

	type Keyframe = RichDataObject['observation']['keyframes'][0];
	type AdDimension = RichDataObject['observation']['ad_dimensions'];
	type SectionIcon = typeof ScanText;

	let {
		richViewExpanded = $bindable(false),
		currentAd = $bindable()
	}: {
		richViewExpanded: boolean;
		currentAd: RichAdData | null;
	} = $props();

	let currentIndex = $state(0);
	let isUpdatingAttributes = $state(false);
	let showOcrOverlay = $state(true);
	let generalOpen = $state(true);
	let ocrOpen = $state(true);
	let cclOpen = $state(true);
	let classificationsOpen = $state(true);
	let tableOpen = $state(false);
	let rawOpen = $state(false);
	let linkedTexts = $state<string[]>([]);
	let frameImageEl = $state<HTMLImageElement | null>(null);
	let frameContainerEl = $state<HTMLDivElement | null>(null);
	let frameImageNaturalWidth = $state(1);
	let frameImageNaturalHeight = $state(1);
	let frameClientWidth = $state(1);
	let frameClientHeight = $state(1);

	$effect(() => {
		const ad = currentAd;
		if (!ad) return;
		untrack(() => {
			const types: ExpandType[] = [
				'attributes',
				'tags',
				'classifications',
				'stitchedFrames',
				'richDataObject',
				'metaLibraryScrape'
			];
			session.ads.enrich(ad, types);
		});
	});

	const frames = $derived(currentAd?.stitchedFrames ?? []);
	const playback = new PlaybackController(() => frames.length, {
		getCurrentFrame: () => currentIndex,
		setCurrentFrame: (frame) => {
			currentIndex = frame;
		}
	});

	const keyframes = $derived(currentAd?.richDataObject?.observation.keyframes ?? []);
	const adDimension = $derived(currentAd?.richDataObject?.observation.ad_dimensions ?? null);
	const observationId = $derived(currentAd?.richDataObject?.observation.uuid ?? null);
	const fullObservationId = $derived(
		observationId ?? (currentAd ? `${currentAd.timestamp}.${currentAd.adId}` : null)
	);
	const displayObservationId = $derived.by(() => {
		if (!fullObservationId) return 'N/A';
		const dotIndex = fullObservationId.indexOf('.');
		return dotIndex >= 0 ? fullObservationId.slice(dotIndex + 1) : fullObservationId;
	});
	const currentKeyframe = $derived(
		keyframes[Math.min(currentIndex, Math.max(keyframes.length - 1, 0))]
	);
	const currentTags = $derived(
		(currentAd?.tags ?? [])
			.map((tagId) => session.tags.getById(tagId))
			.filter((tag) => tag !== undefined)
	);
	const sortedClassifications = $derived(
		(currentAd?.classifications ?? []).toSorted((a, b) => b.score - a.score)
	);
	const richDataJson = $derived(currentAd ? JSON.stringify(currentAd, null, 2) : '');

	const observationFrameOffsets = $derived.by(() => {
		if (!frameImageEl || !frameContainerEl) {
			return { left: 0, top: 0, width: 0, height: 0, scale: 1 };
		}

		const frameBoundingClientRect = frameImageEl.getBoundingClientRect();
		const containerRect = frameContainerEl.getBoundingClientRect();
		const naturalWidth = frameImageNaturalWidth || frameClientWidth;
		const naturalHeight = frameImageNaturalHeight || frameClientHeight;

		const scaleX = frameClientWidth / naturalWidth;
		const scaleY = frameClientHeight / naturalHeight;
		const scale = Math.min(scaleX, scaleY);

		const left =
			(frameClientWidth - naturalWidth * scale) / 2 +
			(frameBoundingClientRect.left - containerRect.left);
		const top =
			(frameClientHeight - naturalHeight * scale) / 2 +
			(frameBoundingClientRect.top - containerRect.top);

		return {
			left,
			top,
			width: naturalWidth * scale,
			height: naturalHeight * scale,
			scale
		};
	});

	const scaledOcrData = $derived.by(() => {
		if (!currentKeyframe || !adDimension) return [];

		const scale = (value: number, dimension: 'w' | 'h' = 'w') =>
			(value / (dimension === 'w' ? adDimension.w : adDimension.h)) * 100;

		return currentKeyframe.ocr_data
			.map((ocrBox) => ({
				...ocrBox,
				x: scale(ocrBox.x),
				y: scale(ocrBox.y, 'h'),
				w: scale(ocrBox.w),
				h: scale(ocrBox.h, 'h')
			}))
			.filter((box) => box.y >= 0 && box.y <= 100);
	});

	type TextAppearance = {
		text: string;
		containingFrames: {
			index: number;
			confidence: number;
		}[];
	};

	const textValues: TextAppearance[] = $derived.by(() => {
		if (!keyframes || !adDimension) return [];
		return keyframes
			.reduce((acc, keyframe, index) => {
				keyframe.ocr_data
					.filter((ocrBox) => ocrBox.y >= 0 && ocrBox.y <= adDimension.h)
					.forEach((ocrBox) => {
						const existing = acc.find((text) => text.text === ocrBox.text);
						if (existing) {
							existing.containingFrames.push({
								index,
								confidence: ocrBox.confidence
							});
						} else {
							acc.push({
								text: ocrBox.text,
								containingFrames: [
									{
										index,
										confidence: ocrBox.confidence
									}
								]
							});
						}
					});
				return acc;
			}, [] as TextAppearance[])
			.toSorted((a, b) => b.containingFrames.length - a.containingFrames.length);
	});

	$effect(() => {
		const adKey = currentAd ? `${currentAd.timestamp}.${currentAd.adId}` : '';
		if (!adKey) return;
		playback.reset();
		linkedTexts = [];
		showOcrOverlay = true;
	});

	$effect(() => {
		if (frames.length === 0) {
			playback.reset();
			return;
		}
		if (currentIndex > frames.length - 1) {
			playback.setCurrentFrame(frames.length - 1);
		}
	});

	async function setAttribute(key: string, value: string) {
		if (!currentAd) return;

		currentAd.attributes = { ...currentAd.attributes, [key]: { value } };
		isUpdatingAttributes = true;
		const { error } = await client.PUT('/ads/{observer_id}/{timestamp}.{ad_id}/attributes', {
			headers: {
				Authorization: `Bearer ${auth.token}`
			},
			params: {
				path: {
					observer_id: currentAd.observer,
					timestamp: currentAd.timestamp.toString(),
					ad_id: currentAd.adId
				}
			},
			body: {
				attribute: {
					key,
					value
				}
			}
		});
		isUpdatingAttributes = false;

		if (error) {
			console.error(error);
			return;
		}

		session.ads.enrich(currentAd, ['attributes'], {
			preferCache: false
		});
	}

	function toggleStarred() {
		if (!currentAd) return;
		setAttribute('starred', boolToString(!stringToBool(currentAd.attributes?.starred?.value)));
	}

	function toggleHidden() {
		if (!currentAd) return;
		setAttribute('hidden', boolToString(!stringToBool(currentAd.attributes?.hidden?.value)));
	}

	function boolToString(value: boolean | undefined): string {
		if (value === undefined) return 'False';
		return value ? 'True' : 'False';
	}

	function stringToBool(value: string | undefined): boolean {
		if (value === undefined) return false;
		return value.toLowerCase() === 'true';
	}

	function formatDateTime(timestamp: number | string | undefined): string {
		if (!timestamp) return 'N/A';
		const value = typeof timestamp === 'number' && timestamp < 1e12 ? timestamp * 1000 : timestamp;
		return new Date(value).toLocaleString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatConfidence(confidence: number): string {
		return `${Math.round(confidence * 100)}%`;
	}

	function isLinked(text: string): boolean {
		return linkedTexts.includes(text);
	}

	function linkText(text: string) {
		if (!linkedTexts.includes(text)) {
			linkedTexts = [...linkedTexts, text];
		}
	}

	function unlinkText(text: string) {
		linkedTexts = linkedTexts.filter((linkedText) => linkedText !== text);
	}

	function moveToNextFrameWithText(text: string) {
		const appearance = textValues.find((item) => item.text === text);
		if (!appearance || appearance.containingFrames.length === 0) return;

		const nextFrame = appearance.containingFrames.find((frame) => frame.index > currentIndex);
		playback.setCurrentFrame(nextFrame ? nextFrame.index : appearance.containingFrames[0].index);
	}

	function confidenceColor(confidence: number) {
		const startHue = 0;
		const endHue = 120;
		const hue = startHue + (endHue - startHue) * confidence;
		return `hsl(${hue}, 100%, 50%)`;
	}
</script>

{#snippet sectionHeader(
	title: string,
	description: string,
	icon: SectionIcon,
	count: number | null,
	open: boolean
)}
	{@const Icon = icon}
	<div class="flex w-full items-center gap-2 py-3 text-left">
		{#if open}
			<ChevronDown class="size-4 shrink-0 text-muted-foreground" />
		{:else}
			<ChevronRight class="size-4 shrink-0 text-muted-foreground" />
		{/if}
		<Icon class="size-4 shrink-0 text-muted-foreground" />
		<span class="text-sm font-medium text-foreground">{title}</span>
		<span class="min-w-0 flex-1 truncate text-xs text-muted-foreground">{description}</span>
		{#if count !== null}
			<span class="text-xs tabular-nums text-muted-foreground">{count}</span>
		{/if}
	</div>
{/snippet}

{#snippet field(label: string, value: string)}
	<div>
		<p class="text-xs text-muted-foreground">{label}</p>
		<p class="mt-1 break-all text-sm font-medium text-foreground">{value}</p>
	</div>
{/snippet}

{#if currentAd}
	<Dialog.Root
		open={richViewExpanded}
		onOpenChange={(open) => {
			richViewExpanded = open;
		}}
	>
		<Dialog.Content
			class="flex !h-[92vh] !max-h-[92vh] !w-[96vw] !max-w-[1400px] flex-col gap-0 overflow-hidden p-0"
		>
			<div
				class="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-y-0 lg:grid-cols-[minmax(360px,0.7fr)_minmax(480px,1.3fr)] lg:grid-rows-1"
			>
				<section class="flex min-h-0 flex-col overflow-hidden bg-black">
					<div
						bind:this={frameContainerEl}
						class="group/frame relative min-h-0 flex-1 overflow-hidden bg-black"
						role="button"
						tabindex="-1"
						aria-label="Ad frames"
						onclick={() => {
							if (playback.isDragging) return;
							playback.toggle();
						}}
						onkeydown={(event) => {
							if (event.key === 'Enter' || event.key === ' ') {
								event.preventDefault();
								playback.toggle();
							}
						}}
						onpointerenter={() => (playback.isHovering = true)}
						onpointerleave={() => {
							playback.isHovering = false;
							playback.isDragging = false;
						}}
					>
						{#if frames.length > 0}
							<img
								bind:this={frameImageEl}
								bind:naturalHeight={frameImageNaturalHeight}
								bind:naturalWidth={frameImageNaturalWidth}
								bind:clientWidth={frameClientWidth}
								bind:clientHeight={frameClientHeight}
								src={frames[currentIndex]}
								alt="Frame {currentIndex + 1} of {frames.length}"
								class="h-full w-full object-contain"
								draggable="false"
								onload={() => playback.handleFrameLoad()}
							/>

							{#if showOcrOverlay && scaledOcrData.length > 0}
								<div
									class="pointer-events-none absolute inset-0 flex items-center justify-center"
									style="left: {observationFrameOffsets.left}px; top: {observationFrameOffsets.top}px; width: {observationFrameOffsets.width}px; height: {observationFrameOffsets.height}px;"
								>
									<div class="relative h-full w-full">
										{#each scaledOcrData as ocrBox}
											{@const linked = isLinked(ocrBox.text)}
											<div
												role="presentation"
												class={twMerge(
													'pointer-events-auto absolute border transition-colors',
													linked ? 'bg-primary/25 ring-2 ring-primary/40' : 'bg-emerald-400/15'
												)}
												style="left: {ocrBox.x}%; top: {ocrBox.y}%; width: {ocrBox.w}%; height: {ocrBox.h}%; border-color: {linked
													? 'hsl(var(--primary))'
													: confidenceColor(ocrBox.confidence)};"
												onpointerenter={() => linkText(ocrBox.text)}
												onpointerleave={() => unlinkText(ocrBox.text)}
											></div>
										{/each}
									</div>
								</div>
							{/if}
						{:else}
							<div class="flex h-full w-full items-center justify-center text-sm text-white/70">
								No frames available
							</div>
						{/if}

						<div
							class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3"
							role="toolbar"
							aria-label="Ad controls"
							tabindex="-1"
							onclick={(event) => event.stopPropagation()}
							onkeydown={(event) => event.stopPropagation()}
						>
							<AdPlaybackControls {playback} frameCount={frames.length} variant="modal">
								<div class="flex items-center gap-2">
									{#if !auth.isGuest}
										<Button
											variant="ghost"
											size="icon"
											class="size-7 p-1 text-white/80 hover:bg-white/10 hover:text-white"
											disabled={!currentAd.attributes || isUpdatingAttributes}
											onclick={(event) => {
												event.stopPropagation();
												toggleStarred();
											}}
											title="Toggle starred"
											aria-label="Toggle starred"
										>
											{#if stringToBool(currentAd.attributes?.starred?.value)}
												<Star class="size-4" fill="gold" stroke="gold" />
											{:else}
												<Star class="size-4" />
											{/if}
										</Button>
										<Button
											variant="ghost"
											size="icon"
											class="size-7 p-1 text-white/80 hover:bg-white/10 hover:text-white"
											disabled={!currentAd.attributes || isUpdatingAttributes}
											onclick={(event) => {
												event.stopPropagation();
												toggleHidden();
											}}
											title="Toggle hidden"
											aria-label="Toggle hidden"
										>
											{#if stringToBool(currentAd.attributes?.hidden?.value)}
												<EyeOff class="size-4" />
											{:else}
												<Eye class="size-4" />
											{/if}
										</Button>
										<Popover.Root>
											<Popover.Trigger>
												<Button
													variant="ghost"
													size="icon"
													class="size-7 p-1 text-white/80 hover:bg-white/10 hover:text-white"
													title="Edit tags"
													aria-label="Edit tags"
												>
													{#if currentAd.tags && currentAd.tags.length > 0}
														<TagsIcon class="size-4 fill-emerald-400 text-emerald-400" />
													{:else}
														<TagsIcon class="size-4" />
													{/if}
												</Button>
											</Popover.Trigger>
											<Popover.Content align="start" class="flex flex-col gap-4 rounded-lg">
												<TagsSelector bind:adData={currentAd} />
											</Popover.Content>
										</Popover.Root>
									{/if}
								</div>
							</AdPlaybackControls>
						</div>
					</div>
				</section>

				<section class="flex min-h-0 flex-col overflow-hidden bg-background">
					<div class="border-b px-6 py-4 pr-12">
						<Dialog.Header class="space-y-2">
							<Dialog.Title class="min-w-0 text-left">
								<span
									class="block truncate font-mono text-base font-normal"
									title={fullObservationId ?? ''}
								>
									{displayObservationId}
								</span>
							</Dialog.Title>
							<Dialog.Description class="text-left">
								<span class="block space-y-2">
									<span class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
										<a
											href={withBase(
												`mobile-observations/observer?observer_id=${currentAd.observer}`
											)}
											class="text-muted-foreground/70 no-underline hover:text-foreground hover:underline"
											title={currentAd.observer}
										>
											{currentAd.observer}
										</a>
										<span class="text-muted-foreground/50">·</span>
										<span class="text-muted-foreground/70">
											{formatDateTime(currentAd.timestamp)}
										</span>
									</span>
									<span class="flex flex-wrap gap-1.5">
										{#each sortedClassifications.slice(0, 5) as classification (`${classification.label}-${classification.score}`)}
											<Badge variant="secondary" class="max-w-full gap-1">
												<span class="truncate">{classification.label}</span>
												<span class="text-muted-foreground">
													{formatConfidence(classification.score)}
												</span>
											</Badge>
										{/each}
										{#each currentTags as tag (tag.id)}
											<Badge variant="outline" class="max-w-full gap-1">
												<span
													class="size-2 rounded-sm"
													style="background-color: {tag.hex};"
													aria-hidden="true"
												></span>
												<span class="truncate">{tag.name}</span>
											</Badge>
										{/each}
									</span>
								</span>
							</Dialog.Description>
						</Dialog.Header>
					</div>

					<div class="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-3">
						<Collapsible.Root bind:open={generalOpen} class="overflow-hidden rounded-lg">
							<Collapsible.Trigger class="w-full hover:bg-muted/50">
								{@render sectionHeader(
									'General',
									'Observation and device metadata',
									Info,
									null,
									generalOpen
								)}
							</Collapsible.Trigger>
							<Collapsible.Content>
								<div class="grid gap-4 border-t py-4 sm:grid-cols-2">
									<div>
										<p class="text-xs text-muted-foreground">Observer ID</p>
										<a
											href={withBase(
												`mobile-observations/observer?observer_id=${currentAd.observer}`
											)}
											class="mt-1 inline-flex text-sm font-medium text-foreground no-underline hover:underline"
											title={currentAd.observer}
										>
											<span class="truncate">{currentAd.observer}</span>
										</a>
									</div>
									{@render field('Ad ID', currentAd.adId)}
									{@render field('Timestamp', formatDateTime(currentAd.timestamp))}
									{@render field('Observation ID', displayObservationId)}
									{#if currentAd.richDataObject}
										{@render field(
											'Observed on device',
											formatDateTime(currentAd.richDataObject.observation.observed_on_device_at)
										)}
										{@render field(
											'Submitted from device',
											formatDateTime(currentAd.richDataObject.observation.submitted_from_device_at)
										)}
									{/if}
								</div>
							</Collapsible.Content>
						</Collapsible.Root>

						<Collapsible.Root bind:open={ocrOpen} class="overflow-hidden rounded-lg">
							<Collapsible.Trigger class="w-full hover:bg-muted/50">
								{@render sectionHeader(
									'OCR',
									'Detected text and frame overlay',
									ScanText,
									textValues.length,
									ocrOpen
								)}
							</Collapsible.Trigger>
							<Collapsible.Content>
								<div class="space-y-4 border-t py-4">
									<label class="inline-flex items-center gap-2 text-sm text-foreground">
										<Checkbox bind:checked={showOcrOverlay} aria-label="Overlay OCR" />
										<span>Overlay OCR on frame</span>
									</label>

									<div>
										<p class="text-xs text-muted-foreground">
											Frame {currentIndex + 1}: {scaledOcrData.length} detection{scaledOcrData.length ===
											1
												? ''
												: 's'}
										</p>
										{#if scaledOcrData.length > 0}
											<div class="mt-2 space-y-1.5">
												{#each scaledOcrData as box, index (`${box.text}-${index}`)}
													{@const linked = isLinked(box.text)}
													<button
														type="button"
														class={twMerge(
															'flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left transition-colors',
															linked ? 'bg-primary/10' : 'bg-background hover:bg-muted/50'
														)}
														onpointerenter={() => linkText(box.text)}
														onpointerleave={() => unlinkText(box.text)}
														onfocus={() => linkText(box.text)}
														onblur={() => unlinkText(box.text)}
													>
														<span class="min-w-0 truncate text-sm text-foreground">{box.text}</span>
														<span class="text-xs tabular-nums text-muted-foreground">
															{formatConfidence(box.confidence)}
														</span>
													</button>
												{/each}
											</div>
										{:else}
											<div
												class="mt-2 rounded-md border border-dashed p-4 text-sm text-muted-foreground"
											>
												No text detected on this frame.
											</div>
										{/if}
									</div>

									{#if textValues.length > 0}
										<div>
											<p class="text-xs text-muted-foreground">Extracted text</p>
											<div class="mt-2 flex flex-wrap gap-1.5">
												{#each textValues as appearance (appearance.text)}
													{@const linked = isLinked(appearance.text)}
													{@const active = appearance.containingFrames.some(
														(frame) => frame.index === currentIndex
													)}
													<button
														type="button"
														class={twMerge(
															'inline-flex max-w-full items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors',
															linked
																? 'border-primary bg-primary/10 text-primary'
																: active
																	? 'border-emerald-300 bg-emerald-50 text-emerald-800'
																	: 'border-border bg-background text-foreground hover:bg-muted/50'
														)}
														onpointerenter={() => linkText(appearance.text)}
														onpointerleave={() => unlinkText(appearance.text)}
														onfocus={() => linkText(appearance.text)}
														onblur={() => unlinkText(appearance.text)}
														onclick={() => moveToNextFrameWithText(appearance.text)}
													>
														<span class="truncate">{appearance.text}</span>
														<span class="text-muted-foreground">
															{appearance.containingFrames.length}
														</span>
													</button>
												{/each}
											</div>
										</div>
									{/if}
								</div>
							</Collapsible.Content>
						</Collapsible.Root>

						<Collapsible.Root bind:open={cclOpen} class="overflow-hidden rounded-lg">
							<Collapsible.Trigger class="w-full hover:bg-muted/50">
								{@render sectionHeader(
									'CCL',
									'Commercial Content Library snapshots',
									Library,
									null,
									cclOpen
								)}
							</Collapsible.Trigger>
							<Collapsible.Content>
								<div class="border-t py-4">
									{#if observationId}
										<CclSnapshotsView {observationId} />
									{:else}
										<div class="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
											Observation ID not available.
										</div>
									{/if}
								</div>
							</Collapsible.Content>
						</Collapsible.Root>

						<Collapsible.Root bind:open={classificationsOpen} class="overflow-hidden rounded-lg">
							<Collapsible.Trigger class="w-full hover:bg-muted/50">
								{@render sectionHeader(
									'Classifications',
									'Detected labels and confidence scores',
									ScanText,
									sortedClassifications.length,
									classificationsOpen
								)}
							</Collapsible.Trigger>
							<Collapsible.Content>
								<div class="space-y-2 border-t py-4">
									{#if sortedClassifications.length > 0}
										{#each sortedClassifications as classification}
											<div class="flex items-center justify-between gap-4 rounded-md border p-3">
												<span class="min-w-0 truncate text-sm font-medium"
													>{classification.label}</span
												>
												<div class="flex shrink-0 items-center gap-3">
													<div class="h-2 w-28 overflow-hidden rounded-sm bg-muted">
														<div
															class="h-full rounded-sm transition-all"
															class:bg-green-500={classification.score >= 0.7}
															class:bg-yellow-500={classification.score >= 0.5 &&
																classification.score < 0.7}
															class:bg-red-500={classification.score < 0.5}
															style="width: {classification.score * 100}%"
														></div>
													</div>
													<span class="w-12 text-right text-xs tabular-nums text-muted-foreground">
														{formatConfidence(classification.score)}
													</span>
												</div>
											</div>
										{/each}
									{:else}
										<div class="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
											No classification data available.
										</div>
									{/if}
								</div>
							</Collapsible.Content>
						</Collapsible.Root>

						<Collapsible.Root bind:open={tableOpen} class="overflow-hidden rounded-lg">
							<Collapsible.Trigger class="w-full hover:bg-muted/50">
								{@render sectionHeader(
									'Table',
									'Selectable export fields',
									Table2,
									null,
									tableOpen
								)}
							</Collapsible.Trigger>
							<Collapsible.Content>
								<div class="border-t py-4">
									{#if currentAd.richDataObject}
										<Table richDataObject={attachRichDataObject(currentAd)} />
									{:else}
										<div class="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
											Rich data is still loading.
										</div>
									{/if}
								</div>
							</Collapsible.Content>
						</Collapsible.Root>

						{#if !auth.isGuest}
							<Collapsible.Root bind:open={rawOpen} class="overflow-hidden rounded-lg">
								<Collapsible.Trigger class="w-full hover:bg-muted/50">
									{@render sectionHeader('Raw JSON', 'Full rich ad payload', Braces, null, rawOpen)}
								</Collapsible.Trigger>
								<Collapsible.Content>
									<div class="border-t py-4">
										<Codemirror
											class="max-h-[32rem] overflow-auto text-left"
											lang={json()}
											lineWrapping
											value={richDataJson}
											readonly
										/>
									</div>
								</Collapsible.Content>
							</Collapsible.Root>
						{/if}
					</div>
				</section>
			</div>
		</Dialog.Content>
	</Dialog.Root>
{/if}
