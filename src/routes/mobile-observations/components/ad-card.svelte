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
		ScanSearch,
		Check
	} from 'lucide-svelte/icons';
	import ImagesGif from '../observer/images-gif.svelte';
	import type { BasicAdData, IndexGroupType, RichAdData } from '$lib/api/session/ads/types';
	import { auth } from '$lib/api/auth/auth.svelte';
	import IntersectionObserverSvelte from 'svelte-intersection-observer/IntersectionObserver.svelte';
	import { withBase } from '$lib/utils';

	import { client } from '$lib/api/client';
	import { twMerge } from 'tailwind-merge';
	import AdCardBody from './ad-card-body.svelte';
	import { INDEX_GROUP_TYPES } from '$lib/api/session/session.svelte';

	export type AdElement = 'adId' | 'time' | 'date' | 'observer';

	export type Props = {
		adData: RichAdData;
		exclude?: AdElement[];
		onExpand?: () => void;
		class?: string;
	};

	let {
		adData,
		exclude = ['observer'],
		onExpand = () => {},
		class: className = ''
	}: Props = $props();

	let element = $state<HTMLElement | null>(null);
	let intersecting = $state(false);
	let framesMode = $state<'raw' | 'stitched'>('stitched');

	const isIncluded = (key: AdElement) => !exclude.includes(key);

	// let attributes = $state<Awaited<ReturnType<typeof fetchAttributes>>>();
	const EXCLUDED_TYPES: IndexGroupType[] = ['ads_passed_restitch'];
	const fullTypes = INDEX_GROUP_TYPES.filter((type) => !EXCLUDED_TYPES.includes(type.value)).filter(
		(type) => {
			return adData.types.includes(type.value);
		}
	);
</script>

<IntersectionObserverSvelte {element} threshold={0.25} once bind:intersecting>
	<div
		class={twMerge(
			'mb-4 flex w-fit break-inside-avoid flex-col gap-2 rounded border bg-zinc-50 p-4 transition-all content-visibility-auto hover:shadow-lg dark:bg-zinc-900 dark:shadow-zinc-800',
			adData.attributes?.hidden?.value && 'opacity-35',
			className
		)}
		bind:this={element}
	>
		<!-- Header -->
		<div class="flex flex-col gap-0.5">
			<div class="flex items-center justify-between gap-2">
				<p class="inline-flex flex-col gap-1 rounded-full py-1 text-sm font-medium">
					{#if isIncluded('date')}
						<span>
							{new Date(adData.timestamp).toLocaleDateString('en-GB', {
								year: '2-digit',
								month: 'short',
								day: 'numeric'
							})}
						</span>
					{/if}
					{#if isIncluded('time')}
						<span>
							{new Date(adData.timestamp).toLocaleTimeString('en-GB', {
								year: undefined,
								hour: '2-digit',
								minute: '2-digit',
								second: '2-digit',
								fractionalSecondDigits: 2,
								hourCycle: 'h11'
							})}
						</span>
					{/if}
				</p>
				<div class="flex items-center gap-2">
					{#if isIncluded('observer')}
						<span class="inline-block text-xs font-extralight">Seen by</span>
						<a
							href={withBase(`mobile-observations/observer?observer_id=${adData.observer}`)}
							class="inline-block w-[12ch] overflow-hidden text-ellipsis text-nowrap rounded-full bg-zinc-300 px-1 text-xs font-light hover:underline dark:bg-zinc-700"
						>
							{adData.observer}
						</a>
					{/if}
					<div>
						<Button
							variant="outline"
							class="size-fit p-1.5"
							size="icon"
							onclick={onExpand}
							disabled
						>
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

		<AdCardBody {adData} visible={intersecting} bind:framesMode />

		<!-- Footer -->
		<div class="flex flex-col gap-2">
			{#if !auth.isGuest}
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
			{/if}
			<div class="flex w-fit gap-1 text-sm">
				{#each fullTypes as type}
					<div
						class="flex items-center gap-2 rounded-full bg-zinc-300 px-2 py-1 text-xs font-light dark:bg-zinc-700"
					>
						<span>
							{type.label}
						</span>
						<Check size={10} />
					</div>
				{/each}
			</div>
		</div>
	</div>
</IntersectionObserverSvelte>
