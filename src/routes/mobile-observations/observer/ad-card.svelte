<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { RotateCcw, Eye, EyeOff, Star } from 'lucide-svelte/icons';
	import ImagesGif from './images-gif.svelte';
	import type { IndividualAdData } from './types';
	import { getAdFrameUrls } from '$lib/api/mobile-observations';
	import { getAuthState } from '$lib/api/auth.svelte';
	import IntersectionObserverSvelte from 'svelte-intersection-observer/IntersectionObserver.svelte';
	import { withBase } from '$lib/utils';

	const {
		adData,
		showObserver = false
	}: {
		adData: IndividualAdData;
		showObserver?: boolean;
	} = $props();

	let element = $state<HTMLElement | null>(null);
	let intersecting = $state(false);

	let images = $state<string[]>([]);
	const auth = getAuthState();

	$effect(() => {
		const fetchImages = async () => {
			if (!auth.currentUser) return;
			images = await getAdFrameUrls(auth.currentUser.token, adData.path);
		};
		// Only fetch images when the ad card is in view (intersecting)
		if (!intersecting) return;
		fetchImages();
	});

	let completed = $state(false);
	const replay = () => {
		completed = false;
	};
</script>

<IntersectionObserverSvelte {element} threshold={0.25} once bind:intersecting>
	<div class="flex flex-col gap-2" bind:this={element}>
		<div class="flex items-center justify-between gap-2">
			<p class="inline-block rounded-full px-2 py-1 font-medium">
				{adData.time}
			</p>

			{#if showObserver}
				<div class="flex items-center gap-2">
					<span class="inline-block text-xs font-extralight">Seen by</span>
					<a
						href={withBase('mobile-observations/observer?observer_id={adData.observer}')}
						class="inline-block w-[12ch] overflow-hidden text-ellipsis text-nowrap rounded-full bg-gray-300 px-1 text-xs font-light hover:underline"
					>
						{adData.observer}
					</a>
				</div>
			{/if}
		</div>

		<div
			class="group flex min-h-80 min-w-64 max-w-full flex-auto transform flex-col gap-2 overflow-hidden rounded border-4 border-transparent shadow-lg transition-transform hover:border-inherit sm:max-w-64"
		>
			<!-- <img class="h-fit object-cover" src="https://placehold.co/400x600" alt="Ad image" /> -->
			{#if images && images.length && images.length > 0}
				<ImagesGif {images} bind:completed />
			{/if}

			<!-- Replay button (center, overlay) -->
			{#if completed}
				<div
					class="absolute top-0 flex h-full w-full flex-col items-center justify-center bg-black bg-opacity-25 text-white opacity-0 group-hover:opacity-100"
				>
					<Button variant="ghost" onclick={replay}>
						<RotateCcw />
					</Button>
				</div>
			{/if}
			<!-- Actions pane on the right -->

			<div
				class="absolute bottom-0 flex h-fit w-full flex-col items-end justify-between bg-inherit text-white"
			>
				<div class="mr-1 flex flex-col">
					<Button variant="ghost" size="sm" class="size-full p-2" disabled>
						<Star class="drop-shadow-strong !size-5" />
					</Button>
					<Button variant="ghost" size="sm" class="size-full p-2" disabled>
						<Eye class="drop-shadow-strong !size-5" />
					</Button>
				</div>
				<!-- <div class="mt-auto w-full bg-gradient-to-t from-black/25 p-4">
				<p class="text-base">Here is a brief description of the ad content.</p>
			</div> -->
			</div>
		</div>
	</div>
</IntersectionObserverSvelte>
