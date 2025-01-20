<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	const {
		x,
		y,
		w,
		h,
		text,
		confidence,
		isLinked
	}: {
		x: number;
		y: number;
		w: number;
		h: number;
		text: string;
		confidence: number;
		isLinked: (text: string) => boolean;
	} = $props();

	const confidenceColor = (confidence: number) => {
		// Hue from red to green
		const startHue = 0; // red
		const endHue = 120; // green
		const hue = startHue + (endHue - startHue) * confidence;
		return `hsl(${hue}, 100%, 50%)`;
	};

	let boxWidth = $state(1);
	let boxHeight = $state(1);
	let textWidth = $state(1);
	let textHeight = $state(1);

	const scaleX = $derived(boxWidth / textWidth);
	const scaleY = $derived(Math.max(boxHeight, 16) / textHeight);
</script>

<div
	class={twMerge(
		'group absolute box-border border-2 bg-brand bg-opacity-0 hover:bg-opacity-15',
		isLinked(text) && 'bg-opacity-15'
	)}
	style={`left: ${x}%; top: ${y}%; width: ${w}%; height: ${h}%; border-color: ${confidenceColor(confidence)};`}
	bind:clientWidth={boxWidth}
	bind:clientHeight={boxHeight}
>
	<div
		class={twMerge(
			'pointer-events-none absolute top-full z-20 size-full min-h-4 border-foreground bg-background text-center text-xs text-foreground opacity-0 shadow group-hover:opacity-100',
			isLinked(text) && 'opacity-100'
		)}
	>
		<div
			bind:clientWidth={textWidth}
			bind:clientHeight={textHeight}
			class="h-fit w-fit origin-top-left"
			style={`transform: scaleX(${scaleX}) scaleY(${scaleY});`}
		>
			<span>
				{text}
			</span>
		</div>
	</div>

	<!-- confidence label -->
	<div
		class="absolute left-full top-0 z-10 flex items-center rounded-r border-2 px-0.5 text-3xs text-foreground"
		style={`border-color: ${confidenceColor(confidence)};`}
	>
		<div class="absolute left-0 top-0 size-full bg-background opacity-85"></div>
		<span class="z-[11]">
			{(confidence * 100).toFixed(0)}%
		</span>
	</div>
</div>
