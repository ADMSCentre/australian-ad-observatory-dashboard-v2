<script lang="ts">
	import { RotateCcw, Braces, Download, Star, EyeOff, Eye, Play, Pause } from 'lucide-svelte';
	import { twMerge } from 'tailwind-merge';
	import { Button } from '$lib/components/ui/button';
	import { Slider } from '$lib/components/ui/slider';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Codemirror from 'svelte-codemirror-editor';
	import { client } from '$lib/api/client';
	import { auth } from '$lib/api/auth/auth.svelte';
	import { json } from '@codemirror/lang-json';
	import ImagesGif from '../observer/images-gif.svelte';
	import type { RichAdData } from '$lib/api/session/ads/types';
	import { session } from '$lib/api/session/session.svelte';
	import { untrack } from 'svelte';

	// {adData} {adData.rawFrames} {completed} {currentIndex} {autoPlay} {onSliderChange}
	type Props = {
		adData: RichAdData;
		visible?: boolean;
		class?: string;
		framesMode?: 'raw' | 'stitched';
	};

	let {
		adData = $bindable(),
		visible = true,
		framesMode = $bindable('stitched'),
		class: className = ''
	}: Props = $props();

	let isUpdatingAttributes = $state(false);
	let autoPlay = $state(true);
	let currentIndex = $state(0);
	let loading = $state(true);

	$effect(() => {
		untrack(() => {
			session.ads.enrich(adData, ['rawFrames', 'stitchedFrames', 'attributes']).then(() => {
				loading = false;
				console.log('Ad data enriched', adData);
			});
		});
	});

	const frames = $derived.by(() => {
		if (loading) {
			return [];
		}
		if (framesMode === 'raw') {
			return adData.rawFrames;
		}
		return adData.stitchedFrames;
	});

	$inspect({ attributes: adData.attributes, isUpdatingAttributes });

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
		// Update the attributes state with the actual value online
		session.ads.enrich(adData, ['attributes'], {
			preferCache: false
		});
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

	let fullJson = $derived.by(() => {
		const data: any = JSON.parse(JSON.stringify(adData));
		return JSON.stringify(data, null, 2);
	});
</script>

<!-- Body -->
<div class="flex max-h-full flex-col gap-2">
	<!-- Main image -->
	<div
		class={twMerge(
			'group flex min-h-40 w-full max-w-full flex-auto transform flex-col gap-2 overflow-hidden rounded border-4 border-transparent shadow-lg transition-transform hover:border-inherit dark:shadow-zinc-800',
			className
		)}
	>
		<!-- <img class="h-fit object-cover" src="https://placehold.co/400x600" alt="Ad image" /> -->
		{#if frames && frames.length && frames.length > 0}
			<ImagesGif images={frames} bind:completed bind:currentIndex bind:autoPlay />
		{:else if loading}
			<div class="flex h-full w-full items-center justify-center bg-foreground text-white">
				Loading...
			</div>
		{:else}
			<div class="flex size-full items-center justify-center bg-foreground text-white">
				<span class="text-center">
					No frames available.
					{#if !auth.isGuest}
						Try <button
							class="inline text-wrap underline"
							onclick={() => {
								framesMode = framesMode === 'raw' ? 'stitched' : 'raw';
							}}
						>
							switching to {framesMode === 'raw' ? 'Cropped' : 'Full'} mode
						</button>.
					{/if}
				</span>
			</div>
		{/if}

		<!-- Replay button (center, overlay) -->
		{#if frames && frames.length > 1 && completed}
			<div
				class="absolute top-0 flex h-full w-full flex-col items-center justify-center bg-foreground bg-opacity-25 text-white opacity-0 transition group-hover:opacity-100"
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

				{#if !auth.isGuest}
					<div class="mr-1 flex flex-col">
						<Button
							variant="ghost"
							size="sm"
							class="size-full p-2"
							disabled={!adData['attributes'] || isUpdatingAttributes}
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
							disabled={!adData['attributes'] || isUpdatingAttributes}
						>
							{#if adData.attributes?.hidden?.value}
								<EyeOff class="!size-5 drop-shadow-strong" />
							{:else}
								<Eye class="!size-5 drop-shadow-strong" />
							{/if}
						</Button>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Controls -->
	{#if frames && frames.length > 1}
		<div class="flex w-full gap-2 pr-2">
			<Button
				variant="ghost"
				size="icon"
				class="p-2"
				onclick={() => {
					// Toggle autoplay if not completed, otherwise replay
					if (completed) {
						replay();
					} else {
						autoPlay = !autoPlay;
					}
				}}
			>
				{#if autoPlay && !completed}
					<Pause />
				{:else}
					<Play />
				{/if}
			</Button>
			<Slider
				type="multiple"
				min={0}
				max={frames.length - 1}
				step={1}
				onValueChange={onSliderChange}
				value={[currentIndex]}
				class="accent-back w-full flex-1"
			/>
		</div>
	{/if}
</div>
