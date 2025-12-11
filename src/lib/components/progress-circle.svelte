<script lang="ts">
	import { theme } from '$lib/states/theme.svelte';

	/**
	 * Defines the structure for the progress state.
	 * This prop is expected to be a Svelte 5 $state object from the parent.
	 */
	type ProgressState = {
		completed: number;
		total: number;
	};

	type Props = {
		progress: ProgressState;
		size?: number;
	};

	let { progress, size = 50 }: Props = $props();

	// Configuration for the circle
	const radius = size / 2; // Radius of the circle
	const circumference = 2 * Math.PI * radius; // 2 * pi * r

	const offset = $derived.by(() => {
		if (progress.total === 0) return circumference;

		const percentage = progress.completed / progress.total;
		// We cap the percentage at 1.0 to prevent negative offset on over-completion.
		const cappedPercentage = Math.min(percentage, 1.0);

		return circumference - cappedPercentage * circumference;
	});

	// const percentage = $derived.by(() => {
	// 	if (progress.total === 0) return 0;
	// 	return Math.round((progress.completed / progress.total) * 100);
	// });
</script>

<svg
	width={size}
	height={size}
	viewBox="{-size / 8} {-size / 8} {size * 1.25} {size * 1.25}"
	version="1.1"
	xmlns="http://www.w3.org/2000/svg"
	style="transform:rotate(-90deg)"
	class=" animate-spin"
>
	<circle
		r={radius}
		cx={size / 2}
		cy={size / 2}
		fill="transparent"
		stroke={theme.colors.backgroundSecondary}
		stroke-width="2"
	></circle>
	<circle
		r={radius}
		cx={size / 2}
		cy={size / 2}
		stroke={theme.colors.foreground}
		stroke-width="2"
		stroke-linecap="round"
		stroke-dashoffset="{offset}px"
		fill="transparent"
		stroke-dasharray="{circumference}px"
	></circle>
</svg>
