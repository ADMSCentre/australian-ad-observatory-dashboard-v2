<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { RotateCcw, Eye, EyeOff, Star, Braces, Download } from 'lucide-svelte/icons';
	import ImagesGif from './images-gif.svelte';
	import type { BasicAdData, RichAdData } from './types';
	import { getAdFrameUrls } from '$lib/api/mobile-observations';
	import { getAuthState } from '$lib/api/auth.svelte';
	import IntersectionObserverSvelte from 'svelte-intersection-observer/IntersectionObserver.svelte';
	import { withBase } from '$lib/utils';
	import { Slider } from '$lib/components/ui/slider';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Codemirror from 'svelte-codemirror-editor';
	import { json } from '@codemirror/lang-json';
	import { client } from '$lib/api/client';
	import { twMerge } from 'tailwind-merge';

	export type Props = {
		adData: RichAdData;
		showObserver?: boolean;
	};

	let { adData = $bindable(), showObserver = false }: Props = $props();

	let element = $state<HTMLElement | null>(null);
	let intersecting = $state(false);
	let currentIndex = $state(0);
	let autoPlay = $state(true);

	let images = $state<string[]>([]);
	let isUpdatingAttributes = $state(false);

	const fetchAttributes = async () => {
		isUpdatingAttributes = true;
		const { data, error } = await client.GET('/ads/{observer_id}/{timestamp}.{ad_id}/attributes', {
			headers: {
				Authorization: `Bearer ${auth.token}`
			},
			params: {
				path: {
					observer_id: adData.observer,
					timestamp: adData.timestamp.toString(),
					ad_id: adData.adId
				}
			}
		});
		isUpdatingAttributes = false;
		if (error) {
			console.error(error);
			return;
		}
		return data.attributes;
	};
	// let attributes = $state<Awaited<ReturnType<typeof fetchAttributes>>>();

	const auth = getAuthState();

	let fullJson = $derived.by(() => {
		const data: any = JSON.parse(JSON.stringify(adData));
		data.frames = images;
		return JSON.stringify(data, null, 2);
	});

	$effect(() => {
		const fetchImages = async () => {
			if (!auth.token) return;
			images = await getAdFrameUrls(auth.token, adData);
		};
		// Only fetch images when the ad card is in view (intersecting)
		if (!intersecting) return;
		fetchImages();
		(async () => {
			adData.attributes = await fetchAttributes();
		})();
	});

	const setAttribute = async (key: string, value: any) => {
		// Optimistically update the attributes state
		adData.attributes = { ...adData.attributes, [key]: { value } };
		isUpdatingAttributes = true;
		const { data, error } = await client.PUT('/ads/{observer_id}/{timestamp}.{ad_id}/attributes', {
			headers: {
				Authorization: `Bearer ${auth.token}`
			},
			params: {
				path: {
					observer_id: adData.observer,
					timestamp: adData.timestamp.toString(),
					ad_id: adData.adId
				}
			},
			body: {
				attribute: {
					key,
					value
				}
			}
		});
		isUpdatingAttributes = false;
		if (error) {
			console.error(error);
			return;
		}
		// Update the attributes state with the true value
		adData.attributes = await fetchAttributes();
	};

	let completed = $state(false);
	const replay = () => {
		completed = false;
	};

	const onSliderChange = (values: number[]) => {
		currentIndex = values[0];
	};

	const downloadJson = () => {
		const blob = new Blob([fullJson], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		const filename = `${adData.observer}_${adData.adId}.json`;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	};
</script>

<IntersectionObserverSvelte {element} threshold={0.25} once bind:intersecting>
	<div
		class={twMerge(
			'mb-4 flex w-fit break-inside-avoid flex-col gap-2 rounded border bg-gray-50 p-4',
			adData.attributes?.hidden?.value && 'opacity-35'
		)}
		bind:this={element}
	>
		<div class="flex items-center justify-between gap-2">
			<p class="inline-block rounded-full px-2 py-1 font-medium">
				{adData.time}
			</p>

			{#if showObserver}
				<div class="flex items-center gap-2">
					<span class="inline-block text-xs font-extralight">Seen by</span>
					<a
						href={withBase(`mobile-observations/observer?observer_id=${adData.observer}`)}
						class="inline-block w-[12ch] overflow-hidden text-ellipsis text-nowrap rounded-full bg-gray-300 px-1 text-xs font-light hover:underline"
					>
						{adData.observer}
					</a>
				</div>
			{/if}
		</div>

		<div
			class={twMerge(
				'group flex min-h-40  max-w-full flex-auto transform flex-col gap-2 overflow-hidden rounded border-4 border-transparent shadow-lg transition-transform hover:border-inherit'
			)}
		>
			<!-- <img class="h-fit object-cover" src="https://placehold.co/400x600" alt="Ad image" /> -->
			{#if images && images.length && images.length > 0}
				<ImagesGif {images} bind:completed bind:currentIndex bind:autoPlay />
			{/if}

			<!-- Replay button (center, overlay) -->
			{#if completed}
				<div
					class="absolute top-0 flex h-full w-full flex-col items-center justify-center bg-black bg-opacity-25 text-white opacity-0 group-hover:opacity-100"
				>
					<Button variant="ghost" onclick={replay} class="z-50">
						<RotateCcw />
					</Button>
				</div>
			{/if}
			<!-- Actions pane on the right -->

			<div
				class="absolute bottom-0 right-0 flex h-fit w-full flex-col items-end justify-between bg-inherit text-white"
			>
				<div class="flex w-full items-end justify-between">
					<div class="mr-1 flex flex-col">
						<Dialog.Root>
							<Dialog.Trigger>
								<Button variant="ghost" size="sm" class="size-full p-2">
									<Braces class="!size-5 drop-shadow-strong" />
								</Button>
							</Dialog.Trigger>
							<Dialog.Content class="max-w-2xl">
								<Dialog.Header>
									<Dialog.Title>JSON Content</Dialog.Title>
									<Dialog.Description>
										<div class="flex flex-col gap-2">
											<Codemirror
												class=" max-h-[75vh] overflow-auto text-left"
												lang={json()}
												lineWrapping
												value={fullJson}
												readonly
											/>
											<div class="flex w-full justify-between">
												<Button onclick={downloadJson}>
													<Download /> Download
												</Button>
											</div>
										</div>
									</Dialog.Description>
								</Dialog.Header>
							</Dialog.Content>
						</Dialog.Root>
					</div>
					<div class="mr-1 flex flex-col">
						<Button
							variant="ghost"
							size="sm"
							class="size-full p-2"
							disabled={!adData.attributes || isUpdatingAttributes}
							onclick={() => {
								setAttribute('starred', !adData.attributes?.starred?.value);
							}}
						>
							<!-- <Star class="!size-5 drop-shadow-strong" /> -->
							{#if adData.attributes?.starred?.value}
								<Star class="!size-5 drop-shadow-strong" fill="gold" stroke="gold" />
							{:else}
								<Star class="!size-5 drop-shadow-strong" />
							{/if}
						</Button>
						<Button
							variant="ghost"
							size="sm"
							class="size-full p-2"
							onclick={() => {
								setAttribute('hidden', !adData.attributes?.hidden?.value);
							}}
							disabled={!adData.attributes || isUpdatingAttributes}
						>
							{#if adData.attributes?.hidden?.value}
								<EyeOff class="!size-5 drop-shadow-strong" />
							{:else}
								<Eye class="!size-5 drop-shadow-strong" />
							{/if}
						</Button>
					</div>
				</div>
				{#if images.length > 1}
					<div class="w-full p-4">
						<Slider
							min={0}
							max={images.length - 1}
							step={1}
							onValueChange={onSliderChange}
							value={[currentIndex]}
							class="accent-back z-50 w-full"
						/>
					</div>
				{/if}
			</div>
		</div>
	</div>
</IntersectionObserverSvelte>
