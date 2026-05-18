<script lang="ts">
	import { Pause, Play, RotateCcw } from 'lucide-svelte';
	import type { Snippet } from 'svelte';
	import type { PlaybackController } from './playback-controller.svelte';

	type Props = {
		playback: PlaybackController;
		frameCount: number;
		children?: Snippet;
	};

	const { playback, frameCount, children }: Props = $props();

	const actionLabel = $derived(
		playback.isPlaying ? 'Pause' : playback.hasPlayed && playback.isAtEnd ? 'Replay' : 'Play'
	);
</script>

{#if frameCount > 1}
	<div
		class="relative h-1.5 cursor-pointer rounded-full bg-white/30"
		role="slider"
		tabindex="0"
		aria-label="Scrub through frames"
		aria-valuemin={0}
		aria-valuemax={frameCount - 1}
		aria-valuenow={playback.currentFrame}
		onpointerdown={(event) => playback.handleScrubStart(event)}
		onpointermove={(event) => playback.handleScrubMove(event)}
		onpointerup={() => playback.handleScrubEnd()}
		onclick={(event) => event.stopPropagation()}
		onkeydown={(event) => {
			if (event.key === 'ArrowRight') {
				playback.moveToNextFrame();
			} else if (event.key === 'ArrowLeft') {
				playback.moveToPreviousFrame();
			}
		}}
	>
		<div
			class="h-full rounded-full bg-white transition-[width] duration-75"
			style="width: {playback.progress * 100}%"
		></div>
	</div>
{/if}

<div class="mt-1.5 flex items-center justify-between">
	{#if frameCount > 1}
		<div class="flex items-center gap-2">
			<button
				type="button"
				class="cursor-pointer rounded p-1 text-white/80 hover:text-white"
				onclick={(event) => {
					event.stopPropagation();
					playback.toggle();
				}}
				title={actionLabel}
				aria-label={actionLabel}
			>
				{#if playback.isPlaying}
					<Pause class="size-3.5" />
				{:else if playback.hasPlayed && playback.isAtEnd}
					<RotateCcw class="size-3.5" />
				{:else}
					<Play class="size-3.5" />
				{/if}
			</button>
			<span class="text-[10px] tabular-nums text-white/70">
				{playback.currentFrame + 1}/{frameCount}
			</span>
		</div>
	{:else}
		<span></span>
	{/if}
	{#if children}
		<div class="flex items-center gap-2">
			{@render children()}
		</div>
	{/if}
</div>
