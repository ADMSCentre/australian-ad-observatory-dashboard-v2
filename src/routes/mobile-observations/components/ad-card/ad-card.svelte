<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { ScanSearch, Check, ChevronRightIcon } from 'lucide-svelte/icons';
	import type { IndexGroupType, RichAdData } from '$lib/api/session/ads/types';
	import IntersectionObserverSvelte from 'svelte-intersection-observer/IntersectionObserver.svelte';
	import { withBase } from '$lib/utils';

	import { twMerge } from 'tailwind-merge';
	import AdCardBody from './ad-card-body.svelte';
	import { INDEX_GROUP_TYPES, session } from '$lib/api/session/session.svelte';
	import { type Tag } from '$lib/api/session/tags/index.svelte';
	import parseActivationCode from '$lib/utils/parse-activation-code';
	import * as HoverCard from '$lib/components/ui/hover-card/index.js';

	export type AdElement = 'adId' | 'time' | 'date' | 'observer';

	export type Props = {
		adData: RichAdData;
		exclude?: AdElement[];
		onExpand?: () => void;
		class?: string;
	};

	const {
		adData,
		exclude = ['observer'],
		onExpand = () => {},
		class: className = ''
	}: Props = $props();

	let element = $state<HTMLElement | null>(null);
	let intersecting = $state(false);

	let reactiveAdData = $state<RichAdData>(adData);

	const isIncluded = (key: AdElement) => !exclude.includes(key);

	// let attributes = $state<Awaited<ReturnType<typeof fetchAttributes>>>();
	const EXCLUDED_TYPES: IndexGroupType[] = ['ads_passed_restitch'];
	const fullTypes = INDEX_GROUP_TYPES.filter((type) => !EXCLUDED_TYPES.includes(type.value)).filter(
		(type) => {
			return adData.types.includes(type.value);
		}
	);

	const appliedTags = $derived.by(() => {
		if (!adData.tags || adData.tags.length === 0) {
			return [];
		}
		return adData.tags
			.map((tagId) => {
				return session.tags.getById(tagId);
			})
			.filter((t) => t !== undefined);
	});

	// Get classifications with a minimum score threshold, or at least 3 classifications
	const CLASSIFICATION_SCORE_THRESHOLD = $derived.by(() => {
		const DEFAULT = 0.5;
		if (adData.classifications && adData.classifications.length >= 3) {
			const sorted = [...adData.classifications].sort((a, b) => b.score - a.score);
			return sorted[Math.min(2, sorted.length - 1)].score;
		}
		return DEFAULT;
	});
	const mainClassifications = $derived.by(() => {
		if (!adData.classifications || adData.classifications.length === 0) {
			return [];
		}
		return adData.classifications
			.filter((c) => c.score >= CLASSIFICATION_SCORE_THRESHOLD)
			.sort((a, b) => b.score - a.score);
	});

	const otherClassifications = $derived.by(() => {
		if (!adData.classifications || adData.classifications.length === 0) {
			return [];
		}
		return adData.classifications
			.filter((c) => c.score < CLASSIFICATION_SCORE_THRESHOLD)
			.sort((a, b) => b.score - a.score);
	});
</script>

{#snippet tag(tag: Tag)}
	<span
		class="group/tag-button relative flex size-fit items-center gap-2 overflow-clip rounded-md p-0"
	>
		<span
			class={twMerge(
				'z-10 inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs',
				'font-medium !text-white'
			)}
			style="color: {tag.hex};"
		>
			{tag.name}
		</span>
		<div
			class={twMerge('absolute left-0 top-0 size-full opacity-100')}
			style="background-color: {tag.hex}"
		></div>
	</span>
{/snippet}

<IntersectionObserverSvelte {element} threshold={0.25} once bind:intersecting>
	<div
		class={twMerge(
			'mb-4 flex w-fit break-inside-avoid flex-col gap-2 rounded border bg-zinc-50 p-4 transition-all content-visibility-auto hover:shadow-lg dark:bg-zinc-900 dark:shadow-zinc-800',
			adData.attributes?.hidden?.value?.toLowerCase() === 'true' && 'opacity-35',
			className
		)}
		bind:this={element}
		style="content-visibility: auto"
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
								hourCycle: 'h12'
							})}
						</span>
					{/if}
				</p>
				<div class="flex items-center gap-2">
					{#if isIncluded('observer')}
						<!-- Observer code is the last 6 digits before the last digit, uppercase -->
						{@const activationCode = parseActivationCode(adData.observer)}
						<span class="inline-block text-xs font-extralight">Seen by</span>
						<a
							href={withBase(`mobile-observations/observer?observer_id=${adData.observer}`)}
							class="inline-block w-fit max-w-[12ch] overflow-hidden text-ellipsis text-nowrap rounded-full bg-zinc-300 px-1 text-xs font-light hover:underline dark:bg-zinc-700"
						>
							{activationCode}
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

		<AdCardBody adData={reactiveAdData} visible={intersecting} />

		<!-- Footer -->
		<div class="flex flex-col gap-2">
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
			<div class="flex w-fit max-w-full flex-wrap items-center gap-2 text-sm">
				{#each appliedTags as t}
					{@render tag(t)}
				{/each}
			</div>
			{#if mainClassifications.length > 0}
				<div class="flex w-fit max-w-full flex-wrap items-center gap-1 text-sm">
					{#each mainClassifications as classification}
						<span
							class="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand hover:bg-brand/20"
							title="Confidence: {(classification.score * 100).toFixed(1)}%"
						>
							{classification.label}
							<span class="text-2xs">
								{(classification.score * 100).toFixed(0)}%
							</span>
						</span>
					{/each}
					{#if otherClassifications.length > 0}
						<HoverCard.Root>
							<HoverCard.Trigger>
								<Button variant="outline" class="size-fit px-2 py-0.5 text-xs">
									{otherClassifications.length} more... <ChevronRightIcon size={12} />
								</Button>
							</HoverCard.Trigger>
							<HoverCard.Content class="w-fit max-w-sm">
								<h3 class="mb-2 text-base font-semibold">Classifications</h3>
								<p class="mb-4 text-sm text-muted-foreground">
									The classifications are generated by an AI model and indicate the likely content
									of the ad. Below are additional classifications with lower confidence scores.
								</p>
								<div class="flex flex-wrap gap-2">
									{#each otherClassifications as classification}
										<div
											class="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand hover:bg-brand/20"
											title="Confidence: {(classification.score * 100).toFixed(1)}%"
										>
											{classification.label}
											<span class="text-2xs">
												{(classification.score * 100).toFixed(0)}%
											</span>
										</div>
									{/each}
								</div>
							</HoverCard.Content>
						</HoverCard.Root>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</IntersectionObserverSvelte>
