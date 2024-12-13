<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import {
		RotateCcw,
		Eye,
		EyeOff,
		Star,
		Braces,
		Download,
		Expand,
		GalleryHorizontal,
		SquareBottomDashedScissors,
		CircleEllipsis,
		ScanSearch
	} from 'lucide-svelte/icons';
	import ImagesGif from '../observer/images-gif.svelte';
	import type { BasicAdData, RichAdData } from '../types';
	import { getAuthState } from '$lib/api/auth.svelte';
	import IntersectionObserverSvelte from 'svelte-intersection-observer/IntersectionObserver.svelte';
	import { withBase } from '$lib/utils';

	import { client } from '$lib/api/client';
	import { twMerge } from 'tailwind-merge';
	import AdCardBody from './ad-card-body.svelte';

	export type Props = {
		adData: RichAdData;
		showObserver?: boolean;
		onExpand?: () => void;
		class?: string;
	};

	let {
		adData = $bindable(),
		showObserver = false,
		onExpand = () => {},
		class: className = ''
	}: Props = $props();

	let element = $state<HTMLElement | null>(null);
	let intersecting = $state(false);
	let framesMode = $state<'raw' | 'stitched'>('stitched');

	// let attributes = $state<Awaited<ReturnType<typeof fetchAttributes>>>();

	const auth = getAuthState();
</script>

<IntersectionObserverSvelte {element} threshold={0.25} once bind:intersecting>
	<div
		class={twMerge(
			'mb-4 flex w-fit break-inside-avoid flex-col gap-2 rounded border bg-zinc-50 p-4 content-visibility-auto dark:bg-zinc-900',
			adData.attributes?.hidden?.value && 'opacity-35',
			className
		)}
		bind:this={element}
	>
		<!-- Header -->
		<div class="flex flex-col gap-0.5">
			<div class="flex items-center justify-between gap-2">
				<p class="inline-block rounded-full py-1 font-medium">
					{adData.time}
				</p>
				<div class="flex items-center gap-2">
					{#if showObserver}
						<span class="inline-block text-xs font-extralight">Seen by</span>
						<a
							href={withBase(`mobile-observations/observer?observer_id=${adData.observer}`)}
							class="inline-block w-[12ch] overflow-hidden text-ellipsis text-nowrap rounded-full bg-zinc-300 px-1 text-xs font-light hover:underline dark:bg-zinc-700"
						>
							{adData.observer}
						</a>
					{/if}
					<div>
						<Button variant="outline" class="size-fit p-1.5" size="icon" onclick={onExpand}>
							<ScanSearch />
						</Button>
					</div>
				</div>
			</div>
			<div class="flex items-center gap-2">
				<span class="text-2xs font-extralight">Ad ID:</span>
				<span class="text-2xs font-light">{adData.adId}</span>
			</div>
		</div>

		<AdCardBody bind:adData visible={intersecting} {framesMode} />

		<div class="w-full text-2xs">
			{#if framesMode === 'raw'}
				<Button
					variant="outline"
					size="sm"
					class="size-fit p-1.5"
					onclick={() => (framesMode = 'stitched')}
				>
					<GalleryHorizontal /> Full Mode
				</Button>
				<p>All parts of the recording are shown</p>
			{:else}
				<Button
					variant="outline"
					size="sm"
					class="size-fit p-1.5"
					onclick={() => (framesMode = 'raw')}
				>
					<SquareBottomDashedScissors /> Cropped Mode
				</Button>
				<p>Only the ad content is shown</p>
			{/if}
		</div>
		<!-- Footer -->
		<div class="flex items-center justify-between gap-2"></div>
	</div>
</IntersectionObserverSvelte>
