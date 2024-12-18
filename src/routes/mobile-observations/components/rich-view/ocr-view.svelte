<script lang="ts">
	import { getAuthState } from '$lib/api/auth.svelte';
	import { getAdFrameUrls } from '$lib/api/mobile-observations';
	import { Slider } from '$lib/components/ui/slider';
	import type { RichDataObject } from '../../rich-data-object-type';
	import { fetchStitchFrames, parseTime } from '../../utils';

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

	const auth = getAuthState();
	let container = $state<HTMLDivElement | null>(null);

	let currentIndex = $state(0);
	let currentKeyframe = $derived.by(() => {
		return keyframes[currentIndex];
	});

	const aspectRatio = $derived(adDimension.w / adDimension.h);
	const ocrData = $derived.by(() => {
		if (!currentKeyframe) return null;
		return currentKeyframe.ocr_data;
	});

	const onSliderChange = (values: number[]) => {
		currentIndex = values[0];
	};

	const scale = (value: number) => {
		if (!container) return 0;
		return (value / adDimension.w) * container.clientWidth;
	};

	const confidenceColor = (confidence: number) => {
		// Hue from red to green
		const startHue = 0; // red
		const endHue = 120; // green
		const hue = startHue + (endHue - startHue) * confidence;
		return `hsl(${hue}, 100%, 50%)`;
	};

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
</script>

{#snippet box({
	x,
	y,
	w,
	h,
	text,
	confidence
}: {
	x: number;
	y: number;
	w: number;
	h: number;
	text: string;
	confidence: number;
})}
	<div
		class="absolute border border-foreground"
		style={`left: ${scale(x)}px; top: ${scale(y)}px; width: ${scale(w)}px; height: ${scale(h)}px;`}
	>
		<div class="border-foreground bg-background bg-opacity-70 text-xs text-foreground shadow">
			{text}
		</div>
		<div
			class="absolute h-0.5 text-xs text-foreground"
			style={`background-color: ${confidenceColor(confidence)}; width: ${confidence * 100}%;`}
		></div>
	</div>
{/snippet}

<div class="flex max-w-sm flex-col gap-2">
	<span>
		{parseTime((currentKeyframe?.observed_at || 0) * 1000, {
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric',
			fractionalSecondDigits: 1
		})}
	</span>
	<div style={`aspect-ratio: ${aspectRatio};`} class="relative border" bind:this={container}>
		{#if frames && frames.length && frames.length > 0}
			<img src={frames[currentIndex]} alt="Ad frame" class="object-cover opacity-50" />
		{/if}
		{#if ocrData}
			{#each ocrData as ocrBox}
				{@render box(ocrBox)}
			{/each}
		{/if}
	</div>

	<Slider
		min={0}
		max={keyframes.length - 1}
		step={1}
		onValueChange={onSliderChange}
		value={[currentIndex]}
		class="accent-back flex-1"
	/>
</div>
