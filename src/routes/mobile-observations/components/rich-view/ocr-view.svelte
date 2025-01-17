<script lang="ts">
	import { auth } from '$lib/api/auth/auth.svelte';
	import { Slider } from '$lib/components/ui/slider';
	import { twMerge } from 'tailwind-merge';
	import type { RichDataObject } from '../../../../lib/api/session/ads/rich-data-object-type';
	import { fetchStitchFrames, formatTimestamp } from '../../../../lib/api/session/ads/utils';
	import OcrTextBox from './ocr-text-box.svelte';

	type Keyframe = RichDataObject['observation']['keyframes'][0];
	type AdDimension = RichDataObject['observation']['ad_dimensions'];

	const {
		adDimension,
		keyframes,
		observerId,
		observationId
	}: {
		adDimension: AdDimension;
		keyframes: Keyframe[];
		observerId: string;
		observationId: string;
	} = $props();

	let container = $state<HTMLDivElement | null>(null);

	let currentIndex = $state(0);
	let currentKeyframe = $derived(keyframes[currentIndex]);

	const aspectRatio = $derived(adDimension.w / adDimension.h);

	const onSliderChange = (values: number[]) => {
		currentIndex = values[0];
	};

	const scaledOcrData = $derived.by(() => {
		if (!currentKeyframe) return [];
		// Scale a value to a percentage relative to the initial ad dimensions
		const scale = (value: number, dimension: 'w' | 'h' = 'w') =>
			(value / (dimension === 'w' ? adDimension.w : adDimension.h)) * 100;

		// Convert all values to percentage for responsiveness
		return currentKeyframe.ocr_data
			.map((ocrBox) => ({
				...ocrBox,
				x: scale(ocrBox.x),
				y: scale(ocrBox.y, 'h'),
				w: scale(ocrBox.w),
				h: scale(ocrBox.h, 'h')
			}))
			.filter((box) => {
				return box.y >= 0 && box.y <= 100;
			});
	});

	// Count all the text values in all the frames
	type TextAppearance = {
		text: string;
		containingFrames: {
			url: string;
			index: number;
			confidence: number;
		}[];
	};
	const textValues: TextAppearance[] = $derived.by(() => {
		if (!keyframes) return [];
		return keyframes
			.reduce((acc, keyframe, index) => {
				keyframe.ocr_data
					.filter((ocrBox) => {
						return ocrBox.y >= 0 && ocrBox.y <= adDimension.h;
					})
					.forEach((ocrBox) => {
						const existing = acc.find((text) => text.text === ocrBox.text);
						if (existing) {
							existing.containingFrames.push({
								url: keyframe.screenshot_cropped,
								index,
								confidence: ocrBox.confidence
							});
						} else {
							acc.push({
								text: ocrBox.text,
								containingFrames: [
									{
										url: keyframe.screenshot_cropped,
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

	let frames = $state<string[]>([]);

	$effect(() => {
		(async () => {
			if (!auth.token) return;
			const urls = await fetchStitchFrames(
				{
					adId: observationId.split('.')[1],
					timestamp: +observationId.split('.')[0],
					observer: observerId
				},
				auth.token
			);
			frames = urls;
			return urls;
		})();
	});

	// Feature to link the extracted text to the text in the current frame
	let linkedTexts = $state<string[]>([]);
	const isLinked = (text: string) => linkedTexts.includes(text);
</script>

<span>
	The following text is extracted from the ad using Optical Character Recognition (OCR).
</span>

<div class="flex max-w-md flex-col gap-2">
	<!-- <span>
		{formatTimestamp((currentKeyframe?.observed_at || 0) * 1000, {
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric',
			fractionalSecondDigits: 1
		})}
	</span> -->

	<!-- Keyframes player -->
	<div class="contents">
		<div style={`aspect-ratio: ${aspectRatio};`} class="relative shadow" bind:this={container}>
			{#if frames && frames.length && frames.length > 0}
				<img src={frames[currentIndex]} alt="Ad frame" class="object-cover" />
				{#each scaledOcrData as ocrBox}
					<OcrTextBox {...ocrBox} {isLinked} />
				{/each}
			{/if}
		</div>

		{#if frames.length > 1}
			<Slider
				type="multiple"
				min={0}
				max={keyframes.length - 1}
				step={1}
				onValueChange={onSliderChange}
				value={[currentIndex]}
				class="accent-back flex-1"
			/>
		{/if}
	</div>

	<!-- Extracted text -->
	<h2 class="text-lg">Extracted Text</h2>
	<div class="flex flex-wrap gap-2">
		{#each Object.values(textValues) as { text, containingFrames }}
			{@const label = containingFrames.length > 1 ? 'frames' : 'frame'}
			{@const active = containingFrames.some((frame) => frame.index === currentIndex)}
			<button
				type="button"
				class={twMerge(
					'flex cursor-auto flex-col gap-1 rounded px-1 shadow-sm',
					active && 'bg-brand bg-opacity-15'
				)}
				onmouseenter={() => linkedTexts.push(text)}
				onmouseleave={() => (linkedTexts = linkedTexts.filter((t) => t !== text))}
			>
				<div class="flex items-center gap-1">
					<span class="text-nowrap">{text}</span>
					<span class="text-3xs text-muted-foreground"> ({containingFrames.length} {label})</span>
				</div>
			</button>
		{/each}
	</div>

	<!-- <pre>{JSON.stringify(currentKeyframe, null, 2)}</pre> -->
	<!-- <pre>{JSON.stringify(textValues, null, 2)}</pre> -->
</div>
