<script lang="ts">
	import { Eye, EyeOff, SearchIcon, Star, TagsIcon } from 'lucide-svelte';
	import { twMerge } from 'tailwind-merge';
	import { Button } from '$lib/components/ui/button';
	import { client } from '$lib/api/client';
	import { auth } from '$lib/api/auth/auth.svelte';
	import type { ExpandType, RichAdData } from '$lib/api/session/ads/types';
	import { session } from '$lib/api/session/session.svelte';
	import { onDestroy, untrack } from 'svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import TagsSelector from './tags-selector.svelte';
	import AdPlaybackControls from './ad-playback-controls.svelte';
	import { PlaybackController } from './playback-controller.svelte';

	type Props = {
		adData: RichAdData;
		visible?: boolean;
		class?: string;
		include?: {
			attributes?: boolean;
			tags?: boolean;
		};
		onExpand?: () => void;
	};

	let {
		adData = $bindable(),
		visible = true,
		class: className = '',
		include = {
			attributes: true,
			tags: true
		},
		onExpand
	}: Props = $props();

	let isUpdatingAttributes = $state(false);
	let currentIndex = $state(0);
	let loading = $state(true);

	$effect(() => {
		untrack(() => {
			const types: ExpandType[] = ['stitchedFrames'];
			if (include.attributes) {
				types.push('attributes');
			}
			if (include.tags) {
				types.push('tags');
			}
			session.ads.enrich(adData, types).then(() => {
				loading = false;
			});
		});
	});

	const frames = $derived.by(() => {
		return adData.stitchedFrames;
	});
	const playback = new PlaybackController(() => frames?.length ?? 0, {
		getCurrentFrame: () => currentIndex,
		setCurrentFrame: (frame) => {
			currentIndex = frame;
		}
	});

	$effect(() => {
		const frameCount = frames?.length ?? 0;
		const isVisible = visible;

		untrack(() => {
			if (isVisible && frameCount > 1) {
				playback.play();
			} else {
				playback.stop();
			}
		});
	});

	$effect(() => {
		if (!frames || frames.length === 0) {
			playback.reset();
			return;
		}
		if (currentIndex > frames.length - 1) {
			playback.setCurrentFrame(frames.length - 1);
		}
	});

	onDestroy(() => {
		playback.stop();
	});

	async function setAttribute(key: string, value: any) {
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
	}

	function boolToString(value: boolean | undefined): string {
		if (value === undefined) {
			return 'False';
		}
		return value ? 'True' : 'False';
	}

	function stringToBool(value: string | undefined): boolean {
		if (value === undefined) {
			return false;
		}
		return value.toLowerCase() === 'true';
	}
</script>

<!-- Body -->
<div class={twMerge('flex h-full min-h-0 flex-col', className)}>
	<div
		class={twMerge(
			'group/image relative flex h-full min-h-0 w-full overflow-hidden bg-muted transition-colors hover:bg-muted/80'
		)}
		role="button"
		tabindex="-1"
		aria-label="Ad frames"
		onclick={() => {
			if (playback.isDragging) return;
			playback.toggle();
		}}
		onkeydown={(event) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				playback.toggle();
			}
		}}
		onpointerenter={() => (playback.isHovering = true)}
		onpointerleave={() => {
			playback.isHovering = false;
			playback.isDragging = false;
		}}
	>
		{#if frames && frames.length && frames.length > 0}
			<img
				src={frames[currentIndex]}
				alt="Frame {currentIndex + 1} of {frames.length}"
				class="h-full w-full object-contain"
				draggable="false"
				loading="lazy"
				onload={() => playback.handleFrameLoad()}
			/>
		{:else if loading}
			<div
				class="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground"
			>
				Loading...
			</div>
		{:else}
			<div
				class="flex size-full items-center justify-center bg-muted text-xs text-muted-foreground"
			>
				<span class="text-center">No frames</span>
			</div>
		{/if}

		<div
			class={twMerge(
				'absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-2 transition-opacity focus-within:opacity-100',
				playback.isHovering || playback.isDragging
					? 'opacity-100'
					: 'opacity-0 group-hover/image:opacity-100'
			)}
			role="toolbar"
			aria-label="Ad controls"
			tabindex="-1"
			onclick={(event) => event.stopPropagation()}
			onkeydown={(event) => event.stopPropagation()}
		>
			<AdPlaybackControls {playback} frameCount={frames?.length ?? 0}>
				<div class="flex items-center gap-2">
					{#if !auth.isGuest}
						{#if include.attributes}
							<Button
								variant="ghost"
								size="icon"
								class="size-6 p-1 text-white/80 hover:bg-white/10 hover:text-white"
								disabled={!adData['attributes'] || isUpdatingAttributes}
								onclick={(event) => {
									event.stopPropagation();
									setAttribute(
										'starred',
										boolToString(!stringToBool(adData.attributes?.starred?.value))
									);
								}}
								title="Toggle starred"
								aria-label="Toggle starred"
							>
								{#if stringToBool(adData.attributes?.starred?.value)}
									<Star class="size-3.5" fill="gold" stroke="gold" />
								{:else}
									<Star class="size-3.5" />
								{/if}
							</Button>
							<Button
								variant="ghost"
								size="icon"
								class="size-6 p-1 text-white/80 hover:bg-white/10 hover:text-white"
								onclick={(event) => {
									event.stopPropagation();
									setAttribute(
										'hidden',
										boolToString(!stringToBool(adData.attributes?.hidden?.value))
									);
								}}
								disabled={!adData['attributes'] || isUpdatingAttributes}
								title="Toggle hidden"
								aria-label="Toggle hidden"
							>
								{#if stringToBool(adData.attributes?.hidden?.value)}
									<EyeOff class="size-3.5" />
								{:else}
									<Eye class="size-3.5" />
								{/if}
							</Button>
						{/if}
						{#if include.tags}
							<Popover.Root>
								<Popover.Trigger>
									<Button
										variant="ghost"
										size="icon"
										class="size-6 p-1 text-white/80 hover:bg-white/10 hover:text-white"
										title="Edit tags"
										aria-label="Edit tags"
									>
										{#if adData.tags && adData.tags.length > 0}
											<TagsIcon class="size-3.5 fill-emerald-400 text-emerald-400" />
										{:else}
											<TagsIcon class="size-3.5" />
										{/if}
									</Button>
								</Popover.Trigger>
								<Popover.Content align="start" class="flex flex-col gap-4 rounded-xl">
									<TagsSelector bind:adData />
								</Popover.Content>
							</Popover.Root>
						{/if}
					{/if}
					{#if onExpand}
						<Button
							variant="ghost"
							size="icon"
							class="size-6 p-1 text-white/80 hover:bg-white/10 hover:text-white"
							onclick={(event) => {
								event.stopPropagation();
								onExpand();
							}}
							title="Explore"
							aria-label="Explore ad"
						>
							<SearchIcon class="size-3.5" />
						</Button>
					{/if}
				</div>
			</AdPlaybackControls>
		</div>
	</div>
</div>
