<script lang="ts">
	import { Play, RotateCcw } from 'lucide-svelte';
	import type { Snippet } from 'svelte';
	import type { PlaybackController } from './playback-controller.svelte';

	type Props = {
		playback: PlaybackController;
		frameCount: number;
		variant?: 'card' | 'modal';
		children?: Snippet;
	};

	const { playback, frameCount, variant = 'card', children }: Props = $props();

	const iconClass = $derived(variant === 'modal' ? 'size-4' : 'size-3.5');
	const pauseClass = $derived(
		variant === 'modal'
			? 'flex size-4 items-center justify-center text-xs font-bold'
			: 'flex size-3.5 items-center justify-center text-[10px] font-bold'
	);
	const counterClass = $derived(
		variant === 'modal'
			? 'text-xs tabular-nums text-white/70'
			: 'text-[10px] tabular-nums text-white/70'
	);
	const rowClass = $derived(
		variant === 'modal'
			? 'mt-2 flex items-center justify-between'
			: 'mt-1.5 flex items-center justify-between'
	);
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

<div class={rowClass}>
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
					<span class={pauseClass}>| |</span>
				{:else if playback.hasPlayed && playback.isAtEnd}
					<RotateCcw class={iconClass} />
				{:else}
					<Play class={iconClass} />
				{/if}
			</button>
			<span class={counterClass}>{playback.currentFrame + 1}/{frameCount}</span>
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
