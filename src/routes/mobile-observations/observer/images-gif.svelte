<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import IntersectionObserver from 'svelte-intersection-observer';
	import { Circle } from 'svelte-loading-spinners';

	// export let images = [];
	// export let interval = 1000; // Interval in milliseconds

	let {
		images,
		interval = 200,
		completed = $bindable(),
		currentIndex = $bindable(0),
		autoPlay = $bindable(true)
	}: {
		images: string[];
		interval?: number;
		completed: boolean;
		currentIndex: number;
		autoPlay: boolean;
	} = $props();

	let intersectOnce = $state(false);
	let element = $state<HTMLElement | null>(null);
	let repeat = $state(0);
	let imageLoadings = $state(images.map(() => true));

	function nextImage() {
		// Do not advance if the current image is not loaded
		if (imageLoadings[currentIndex]) return;
		if (completed) return;
		const isFinal = currentIndex + 1 === images.length;
		if (isFinal) {
			currentIndex = 0;
			completed = true;
			return;
		}
		currentIndex = (currentIndex + 1) % images.length;
	}

	// function handleSliderChange(event: Event) {
	// 	clearInterval(repeat);
	// 	completed = true;
	// 	currentIndex = parseInt((event.target as HTMLInputElement).value, 10);
	// }

	$effect(() => {
		if (autoPlay) {
			repeat = setInterval(nextImage, interval);
		} else {
			clearInterval(repeat);
		}
	});

	onDestroy(() => {
		clearInterval(repeat);
	});
</script>

<IntersectionObserver
	{element}
	once
	bind:intersecting={intersectOnce}
	threshold={0.5}
	on:intersect={(e) => {
		clearInterval(repeat);
		completed = false;
		currentIndex = 0;
		repeat = setInterval(nextImage, interval);
	}}
>
	<div bind:this={element}>
		{#each images as image, index}
			<img
				loading="lazy"
				src={image}
				alt="GIF frame"
				class={twMerge(
					'h-full w-full object-cover content-visibility-auto',
					index !== currentIndex && 'absolute opacity-0'
				)}
				onload={(e: any) => {
					const src = e.target?.src;
					if (src === image) {
						imageLoadings[index] = false;
					}
				}}
			/>
		{/each}
	</div>
</IntersectionObserver>
