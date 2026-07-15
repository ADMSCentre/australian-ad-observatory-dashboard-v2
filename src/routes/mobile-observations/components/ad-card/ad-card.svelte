<script lang="ts" module>
	export type AdElement = 'adId' | 'time' | 'date' | 'observer';

	export type HiddenDisplayMode = 'overlay' | 'normal';

	export type Props = {
		adData: import('$lib/api/session/ads/types').RichAdData;
		exclude?: AdElement[];
		onExpand?: () => void;
		class?: string;
		/** How to render hidden ads: 'overlay' shows a click-to-reveal stub, 'normal' shows the card with a "Hidden" badge */
		hiddenDisplayMode?: HiddenDisplayMode;
	};
</script>

<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import {
		CalendarClock,
		Check,
		ChevronRightIcon,
		EyeOff,
		LoaderCircle,
		Smartphone
	} from 'lucide-svelte/icons';
	import type { IndexGroupType, RichAdData } from '$lib/api/session/ads/types';
	import IntersectionObserverSvelte from 'svelte-intersection-observer/IntersectionObserver.svelte';
	import { withBase } from '$lib/utils';

	import { twMerge } from 'tailwind-merge';
	import AdCardBody from './ad-card-body.svelte';
	import { INDEX_GROUP_TYPES, session } from '$lib/api/session/session.svelte';
	import { type Tag } from '$lib/api/session/tags/index.svelte';
	import parseActivationCode from '$lib/utils/parse-activation-code';
	import * as HoverCard from '$lib/components/ui/hover-card/index.js';
	import { cclAvailability } from '$lib/api/ccl.svelte';

	const {
		adData,
		exclude = ['observer'],
		onExpand = () => {},
		class: className = '',
		hiddenDisplayMode = 'normal'
	}: Props = $props();

	let element = $state<HTMLElement | null>(null);
	let intersecting = $state(false);

	let reactiveAdData = $state<RichAdData>(adData);

	const isIncluded = (key: AdElement) => !exclude.includes(key);

	const isHidden = $derived(adData.attributes?.hidden?.value?.toLowerCase() === 'true');
	/** Whether a hidden-placeholder card has been temporarily revealed by the user */
	let placeholderRevealed = $state(false);
	/** Whether the card should render as a placeholder (hidden + overlay mode + not revealed) */
	const showPlaceholder = $derived(
		isHidden && hiddenDisplayMode === 'overlay' && !placeholderRevealed
	);
	/** Whether the card should show the "Hidden" badge (normal mode or revealed placeholder) */
	const showHiddenBadge = $derived(
		isHidden && (hiddenDisplayMode === 'normal' || placeholderRevealed)
	);

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

	// CCL availability badge - check when card becomes visible
	const cclObservationId = `${adData.adId}`;
	$effect(() => {
		if (intersecting) {
			cclAvailability.check(cclObservationId);
		}
	});
	const cclChecked = $derived(cclAvailability.hasChecked(cclObservationId));
	const cclLoading = $derived(cclAvailability.isLoading(cclObservationId));
	const cclIsAvailable = $derived(cclAvailability.isAvailable(cclObservationId));
</script>

{#snippet tag(tag: Tag)}
	<span
		class="inline-flex max-w-full items-center rounded-md px-1.5 py-0 text-[10px] font-medium text-white"
		style="background-color: {tag.hex};"
	>
		<span class="truncate">
			{tag.name}
		</span>
	</span>
{/snippet}

<IntersectionObserverSvelte {element} threshold={0.25} once bind:intersecting>
	{#if showPlaceholder}
		<!-- Hidden ad placeholder (overlay mode) -->
		<article
			class={twMerge(
				'group flex h-[calc(100%-1rem)] w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-muted/30 transition-colors hover:bg-muted/50',
				className,
				'flex min-h-[320px] border-dashed border-border hover:border-muted-foreground/30 sm:min-h-[384px]'
			)}
			bind:this={element}
		>
			<button
				type="button"
				class="flex size-full cursor-pointer flex-col items-center justify-center gap-2 px-4 py-6 text-center transition-colors"
				onclick={() => {
					placeholderRevealed = true;
				}}
				aria-label="Reveal hidden ad"
			>
				<span
					class="rounded-full bg-muted p-2.5 transition-colors group-hover:bg-muted-foreground/10"
				>
					<EyeOff
						class="size-5 text-muted-foreground/50 transition-colors group-hover:text-muted-foreground"
					/>
				</span>
				<span class="text-xs font-medium text-muted-foreground">Hidden ad</span>
				<span
					class="text-[10px] text-muted-foreground/60 transition-colors group-hover:text-muted-foreground"
					>Click to reveal</span
				>
			</button>
		</article>
	{:else}
		<article
			class={twMerge(
				'relative mb-4 overflow-hidden rounded-lg border border-border bg-card transition-colors content-visibility-auto hover:bg-muted/20',
				className,
				'grid w-full grid-rows-[320px_auto] sm:grid-rows-[384px_auto]'
			)}
			bind:this={element}
			style="content-visibility: auto"
		>
			{#if showHiddenBadge}
				<div class="absolute left-2 top-2 z-10">
					{#if hiddenDisplayMode === 'overlay'}
						<button
							type="button"
							class="inline-flex cursor-pointer items-center gap-1 rounded-full bg-muted/90 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground backdrop-blur-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							onclick={() => {
								placeholderRevealed = false;
							}}
							aria-label="Hide hidden ad overlay"
						>
							<EyeOff class="size-2.5" />
							Hidden - click to hide
						</button>
					{:else}
						<span
							class="inline-flex items-center gap-1 rounded-full bg-muted/90 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground backdrop-blur-sm"
						>
							<EyeOff class="size-2.5" />
							Hidden
						</span>
					{/if}
				</div>
			{/if}
			<AdCardBody adData={reactiveAdData} visible={intersecting} {onExpand} />

			<div class="grid h-full content-start gap-2 overflow-hidden p-3">
				<div class="flex items-start justify-between gap-2">
					<div class="w-full min-w-0">
						<div class="flex w-full items-center justify-between gap-2">
							<p
								class="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 pb-1 text-xs font-medium text-foreground"
							>
								<CalendarClock class="size-3 shrink-0 text-muted-foreground" />
								{#if isIncluded('date')}
									<span>
										{new Date(adData.timestamp).toLocaleDateString('en-GB', {
											year: 'numeric',
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
							{#if isIncluded('observer')}
								{@const activationCode = parseActivationCode(adData.observer)}
								<a
									href={withBase(`mobile-observations/observer?observer_id=${adData.observer}`)}
									class="flex shrink-0 items-center gap-1 text-xs text-muted-foreground no-underline hover:text-foreground hover:underline"
									title={adData.observer}
								>
									<Smartphone class="size-3 shrink-0" />
									<span class="rounded border border-muted bg-muted/50 px-1 text-[10px]">
										{activationCode}
									</span>
								</a>
							{/if}
						</div>
						<div class="flex min-w-0 items-center justify-between gap-2">
							<p class="truncate font-mono text-[10px] text-muted-foreground" title={adData.adId}>
								{adData.adId}
							</p>
						</div>
					</div>
				</div>

				<div class="flex flex-wrap items-center gap-1 text-[10px] text-muted-foreground">
					{#each fullTypes as type}
						<div
							class="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-1.5 py-0"
						>
							<span>
								{type.label}
							</span>
							<Check size={10} />
						</div>
					{/each}
					<!-- CCL availability badge -->
					{#if cclLoading}
						<div
							class="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-1.5 py-0"
						>
							<LoaderCircle class="h-3 w-3 animate-spin text-muted-foreground" />
							<span>CCL...</span>
						</div>
					{:else if cclChecked}
						<div
							class="inline-flex items-center gap-1 rounded-md border px-1.5 py-0 font-medium {cclIsAvailable
								? 'border-green-600/25 bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
								: 'border-border bg-muted/50 text-muted-foreground'}"
						>
							<span
								class="h-1.5 w-1.5 rounded-full {cclIsAvailable
									? 'bg-green-600 dark:bg-green-400'
									: 'bg-muted-foreground/50'}"
							></span>
							{cclIsAvailable ? 'CCL Available' : 'No CCL'}
						</div>
					{/if}
				</div>

				<div class="flex min-w-0 flex-wrap items-center gap-1 overflow-hidden">
					{#each appliedTags as t}
						{@render tag(t)}
					{/each}
				</div>

				{#if mainClassifications.length > 0}
					<div class="min-w-0 overflow-hidden">
						<div class="flex flex-wrap items-center gap-1 overflow-hidden">
							{#each mainClassifications as classification}
								<span
									class="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-1.5 py-0 text-[10px] font-medium text-foreground"
									title="Confidence: {(classification.score * 100).toFixed(1)}%"
								>
									{classification.label}
									<span class="text-muted-foreground">
										{(classification.score * 100).toFixed(0)}%
									</span>
								</span>
							{/each}
							{#if otherClassifications.length > 0}
								<HoverCard.Root>
									<HoverCard.Trigger>
										<Button variant="outline" class="h-5 px-1.5 py-0 text-[10px]">
											{otherClassifications.length} more... <ChevronRightIcon size={12} />
										</Button>
									</HoverCard.Trigger>
									<HoverCard.Content class="w-80 rounded-xl">
										<h3 class="mb-2 text-base font-semibold">Classifications</h3>
										<p class="mb-4 text-sm text-muted-foreground">
											The classifications are generated by an AI model and indicate the likely
											content of the ad. Below are additional classifications with lower confidence
											scores.
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
					</div>
				{/if}
			</div>
		</article>
	{/if}
</IntersectionObserverSvelte>
