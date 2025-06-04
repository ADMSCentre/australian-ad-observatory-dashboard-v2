<script lang="ts">
	import { json } from '@codemirror/lang-json';
	import type {
		MediaSource,
		RichDataObject
	} from '../../../../lib/api/session/ads/rich-data-object-type';
	import Codemirror from 'svelte-codemirror-editor';
	import Accordion from '$lib/components/accordion/accordion.svelte';
	import {
		ChevronRight,
		Facebook,
		FacebookIcon,
		Globe,
		Image,
		SquareStack,
		Video
	} from 'lucide-svelte';
	import { twMerge } from 'tailwind-merge';
	import Dropdown from '$lib/components/dropdown/dropdown.svelte';
	import { flip } from 'svelte/animate';
	import { data } from '../../../users/columns.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { fetchMedia, formatTimestamp } from '../../../../lib/api/session/ads/utils';
	import { auth } from '$lib/api/auth/auth.svelte';

	const {
		candidates,
		rankings = null,
		mediaMapping
	}: {
		candidates: RichDataObject['enrichment']['meta_adlibrary_scrape']['candidates'];
		rankings: RichDataObject['enrichment']['meta_adlibrary_scrape']['rankings'] | null;
		mediaMapping: Record<string, { filename: string; fullPath: string }>;
	} = $props();

	type RichCandidate = RichDataObject['enrichment']['meta_adlibrary_scrape']['candidates'][0] & {
		ranking: ReturnType<typeof getRanking>;
	};

	type SortMode =
		| 'overall-ranking-desc'
		| 'overall-ranking-asc'
		| 'start-date-desc'
		| 'start-date-asc'
		| 'end-date-desc'
		| 'end-date-asc';

	$inspect({ candidates });

	const sortOptions: {
		value: SortMode;
		label: string;
		available: boolean;
		sortFn: (a: RichCandidate, b: RichCandidate) => number;
	}[] = [
		{
			value: 'overall-ranking-desc',
			label: 'Highest Overall Score',
			available: !!rankings,
			sortFn: (a: RichCandidate, b: RichCandidate) => {
				const aScore = calculateOverallRankingScore(a.ranking);
				const bScore = calculateOverallRankingScore(b.ranking);
				return bScore - aScore;
			}
		},
		{
			value: 'overall-ranking-asc',
			label: 'Lowest Overall Score',
			available: !!rankings,
			sortFn: (a: RichCandidate, b: RichCandidate) => {
				const aScore = calculateOverallRankingScore(a.ranking);
				const bScore = calculateOverallRankingScore(b.ranking);
				return aScore - bScore;
			}
		},
		{
			value: 'start-date-desc',
			label: 'Newest Start Date',
			available: true,
			sortFn: (a: RichCandidate, b: RichCandidate) => {
				return new Date(b.data.start_date).getTime() - new Date(a.data.start_date).getTime();
			}
		},
		{
			value: 'start-date-asc',
			label: 'Oldest Start Date',
			available: true,
			sortFn: (a: RichCandidate, b: RichCandidate) => {
				return new Date(a.data.start_date).getTime() - new Date(b.data.start_date).getTime();
			}
		},
		{
			value: 'end-date-desc',
			label: 'Newest End Date',
			available: true,
			sortFn: (a: RichCandidate, b: RichCandidate) => {
				return new Date(b.data.end_date).getTime() - new Date(a.data.end_date).getTime();
			}
		},
		{
			value: 'end-date-asc',
			label: 'Oldest End Date',
			available: true,
			sortFn: (a: RichCandidate, b: RichCandidate) => {
				return new Date(a.data.end_date).getTime() - new Date(b.data.end_date).getTime();
			}
		}
	].filter((option) => option.available) as typeof sortOptions;

	const getRanking = (candidateId: number) => {
		if (!rankings) return null;
		const index = rankings.findIndex(
			(ranking) => ranking.this_selected_candidate_i === candidateId
		);
		return index === -1
			? null
			: {
					ranking: index + 1,
					...rankings[index]
				};
	};

	let sortMode = $state<SortMode>(sortOptions[0].value);

	const richCandidates: RichCandidate[] = $derived(
		candidates.map((candidate) => {
			return {
				...candidate,
				ranking: getRanking(candidate?.ad_library_scrape_candidates_i)
			};
		})
		// .slice(0, 2)
	);

	$inspect({ richCandidates });

	const orderedCandidates = $derived(
		richCandidates.toSorted(sortOptions.find((option) => option.value === sortMode)!.sortFn)
	);

	const formatRankingScore = (score: number | null) => {
		if (score === null) return 'N/A';
		return (score * 100).toFixed(0);
	};

	const calculateOverallRankingScore = (
		ranking: RichDataObject['enrichment']['meta_adlibrary_scrape']['rankings'][0] | null
	) => {
		if (!ranking) return 0;
		return Object.values(ranking.components).reduce((acc, value) => {
			if (value > acc) {
				acc = value;
			}
			return acc;
		}, 0);
	};

	const confidenceColor = (confidence: number) => {
		// Hue from red to green
		const startHue = 0; // red
		const endHue = 120; // green
		const hue = startHue + (endHue - startHue) * confidence;
		return `hsl(${hue}, 100%, 50%)`;
	};

	const getDetailedTimestampFormat = (timestamp: number) => {
		const daysAgo = Math.round(
			(new Date().getTime() - new Date(timestamp).getTime()) / (1000 * 60 * 60 * 24)
		);
		const daysAgoFormatted = new Intl.RelativeTimeFormat('en', {
			numeric: 'auto'
		}).format(daysAgo, 'day');
		return {
			formatted: {
				short: formatTimestamp(timestamp),
				full: formatTimestamp(timestamp, {
					weekday: 'long',
					year: 'numeric',
					month: 'long',
					day: 'numeric',
					hour: 'numeric',
					minute: 'numeric',
					second: 'numeric'
				})
			},
			daysAgo: {
				value: daysAgo,
				formatted: daysAgoFormatted
			}
		};
	};

	const mapMedia = (mediaObj: { [kind: string]: string | unknown }, kinds: string[] = []) => {
		return Object.keys(mediaObj)
			.reduce(
				(acc, key) => {
					const original = mediaObj[key];
					if (typeof original !== 'string') return acc;
					const mapped = mediaMapping[original]?.fullPath;
					if (mapped) {
						acc.push({
							kind: key,
							src: {
								original,
								mapped
							}
						});
					}
					return acc;
				},
				[] as {
					kind: string;
					src: {
						original: string;
						mapped: string;
					};
				}[]
			)
			.filter((media) => kinds.length === 0 || kinds.includes(media.kind));
	};

	const getMediaUrl = async (path: string) => {
		const media = mediaMapping[path];
		if (!media) return null;
		if (!auth?.token) return null;
		return await fetchMedia(media.fullPath, auth?.token);
	};
</script>

{#snippet rankingValueTag(value: number | null, label: string)}
	{#if value}
		<span class="relative border px-0.5">
			<!-- Score background using confidence color -->
			<div
				class="absolute left-0 top-0 -z-[1] h-full w-full opacity-15"
				style={'background-color: ' + confidenceColor(value)}
			></div>
			{formatRankingScore(value)}% {label}
		</span>
	{/if}
{/snippet}

{#snippet statCard(value: string | null, label: string)}
	<div
		class="flex w-32 flex-col items-center gap-1 rounded bg-gradient-to-br from-background via-brand/15 to-background p-2 shadow"
	>
		<div class="text-lg font-semibold drop-shadow">
			{value || 'N/A'}
		</div>
		<div class="text-xs text-gray-500">
			{label}
		</div>
	</div>
{/snippet}

{#snippet videoPlayer(src: string)}
	<video {src} controls preload="metadata">
		<track kind="captions" />
	</video>
{/snippet}

<!-- <pre>{JSON.stringify(rankings, null, 2)}</pre> -->

<div class="flex flex-col items-end gap-1">
	<div>
		<span class="text-sm font-medium">Sort by:</span>
		<Dropdown
			bind:selected={sortMode}
			onSelected={(value) => {
				sortMode = value;
			}}
			options={sortOptions}
		/>
	</div>

	<div class="flex w-full flex-col gap-4">
		{#each orderedCandidates as candidate, index (candidate)}
			{@const startTime = getDetailedTimestampFormat(candidate.data.start_date * 1000)}
			{@const endTime = getDetailedTimestampFormat(candidate.data.end_date * 1000)}
			<div animate:flip={{ duration: 300 }}>
				<Accordion class="flex w-full flex-col" open>
					{#snippet summary(open)}
						<div
							class="z-10 flex w-full cursor-pointer flex-col-reverse gap-2 border-b bg-muted px-2 py-1.5 text-left backdrop-blur-sm md:flex-row md:items-center md:justify-between"
						>
							<div class="flex items-center gap-2">
								<ChevronRight
									class={twMerge('size-4 transition', open ? 'rotate-90 transform' : '')}
								/>
								<div class="flex items-center gap-2">
									{#if candidate.data.snapshot.display_format === 'VIDEO'}
										<Video />
									{:else if candidate.data.snapshot.display_format === 'IMAGE'}
										<Image />
									{:else if candidate.data.snapshot.display_format === 'DCO'}
										<SquareStack />
									{/if}
									<div class="flex flex-col gap-0">
										<h2 class="text-lg font-bold">{candidate.data.page_name}</h2>
										<div class="flex items-center gap-1 text-2xs text-gray-500">
											<span>
												{startTime.formatted.short}
											</span>
											<span>
												-
												{#if !candidate.data.end_date}
													Now
												{:else}
													{endTime.formatted.short}
												{/if}
											</span>
										</div>
									</div>
								</div>
							</div>
							{#if candidate.ranking}
								<div class="flex items-center gap-1 md:flex-col md:items-end">
									<span class="text-2xs text-gray-500">
										{formatRankingScore(calculateOverallRankingScore(candidate.ranking))}% match
									</span>
									<div class="flex items-center gap-1 text-2xs text-gray-500 md:text-3xs">
										{@render rankingValueTag(candidate.ranking.components.ocr_coverage, 'OCR')}
										{@render rankingValueTag(
											candidate.ranking.components.rankings_from_images,
											'Image'
										)}
										{@render rankingValueTag(
											candidate.ranking.components.ranking_from_videos,
											'Video'
										)}
									</div>
								</div>
							{/if}
						</div>
					{/snippet}
					<!-- Ad body -->
					<div class="flex flex-col gap-2 p-2">
						<div class="flex items-center justify-between">
							<span class="flex items-center gap-2 font-medium">
								{candidate.data.snapshot.title}
							</span>

							<!-- Group: links -->
							<div class="flex items-center gap-1">
								<Button
									href={candidate.data.snapshot.page_profile_uri}
									target="_blank"
									variant="outline"
									size="icon"
									rel="noopener noreferrer"
									class="size-fit p-2 font-medium text-blue-500 hover:underline"
								>
									<!-- {candidate.data.page_name} -->
									<FacebookIcon size={16} />
								</Button>
								<Button
									href={candidate.data.snapshot.link_url}
									target="_blank"
									variant="outline"
									size="icon"
									rel="noopener noreferrer"
									class="size-fit p-2 font-medium text-blue-500 hover:underline"
								>
									<!-- {candidate.data.page_name} -->
									<Globe size={16} />
								</Button>
							</div>
						</div>

						<!-- Summary -->

						<Accordion class="flex flex-col gap-0" open>
							{#snippet summary(open)}
								<span
									class="flex w-fit items-center gap-1 bg-muted-foreground pl-1 pr-2 text-xs font-medium text-background"
								>
									<ChevronRight
										class={twMerge('size-3 transition', open ? 'rotate-90 transform' : '')}
									/>
									Marketing Statistics
								</span>
							{/snippet}
							<div class="flex gap-2 py-2">
								{@render statCard(candidate.data.reach_estimate, 'estimated reach')}
								{@render statCard(
									candidate.data.impressions_with_index.impressions_text,
									'impressions'
								)}
								{@render statCard(candidate.data.spend, 'spent')}
							</div>
						</Accordion>
						<!-- Group: body -->
						{#if candidate.data.snapshot.display_format !== 'DCO'}
							<Accordion class="flex flex-col gap-0" open>
								{#snippet summary(open)}
									<span
										class="flex w-fit items-center gap-1 bg-muted-foreground pl-1 pr-2 text-xs font-medium text-background"
									>
										<ChevronRight
											class={twMerge('size-3 transition', open ? 'rotate-90 transform' : '')}
										/>
										Content
									</span>
								{/snippet}
								<div
									class=" flex flex-col items-center justify-center gap-2 whitespace-pre-wrap border border-muted-foreground p-2 sm:flex-row sm:items-start sm:justify-start"
								>
									<div class="max-w-sm">
										{#each candidate.data.snapshot.videos as video}
											{@const medias = mapMedia(video, ['video_sd_url'])}
											{#each medias as media}
												{#await getMediaUrl(media.src.original) then src}
													{@render videoPlayer(src)}
												{/await}
											{/each}
											{#if medias.length === 0}
												<div>Unable to load video</div>
											{/if}
											<!-- <pre>{JSON.stringify(mapMedia(video), null, 2)}</pre> -->
										{/each}
										{#each candidate.data.snapshot.images as image}
											{@const medias = mapMedia(image, ['resized_image_url'])}
											{#each medias as media}
												{#await getMediaUrl(media.src.original) then src}
													<img {src} alt={media.kind} />
												{/await}
											{/each}
											<!-- <pre>{JSON.stringify(mapMedia(image), null, 2)}</pre> -->
										{/each}
									</div>

									<div class="w-full">
										{@html candidate.data.snapshot.body.text}
									</div>
								</div>
							</Accordion>
						{:else}
							<Accordion class="flex flex-col gap-0" open>
								{#snippet summary(open)}
									<span
										class="flex w-fit items-center gap-1 bg-muted-foreground pl-1 pr-2 text-xs font-medium text-background"
									>
										<ChevronRight
											class={twMerge('size-3 transition', open ? 'rotate-90 transform' : '')}
										/>
										Content
									</span>
								{/snippet}
								<div
									class=" flex flex-col items-center justify-center gap-2 whitespace-pre-wrap border border-muted-foreground p-2 sm:items-start sm:justify-start"
								>
									{#each candidate.data.snapshot.cards as card}
										{@const medias = mapMedia(card, ['resized_image_url', 'video_sd_url'])}
										<div
											class="flex flex-col items-center justify-center gap-2 sm:flex-row sm:items-start sm:justify-start"
										>
											<div class=" max-w-sm">
												{#each medias as media}
													{#await getMediaUrl(media.src.original) then src}
														{#if media.kind === 'resized_image_url'}
															<img {src} alt={media.kind} class=" object-contain" />
														{:else if media.kind === 'video_sd_url'}
															{@render videoPlayer(src)}
														{/if}
													{/await}
												{/each}
											</div>
											<div class="flex w-full flex-1 flex-col gap-2">
												<h3 class="text-sm font-semibold">{card.title}</h3>
												<div class="whitespace-pre-wrap">{@html card.body}</div>
											</div>
										</div>
										<!-- <pre class="flex-1">{JSON.stringify(card, null, 2)}</pre> -->
									{/each}
								</div>
							</Accordion>
						{/if}

						<Accordion>
							{#snippet summary(open)}
								<span
									class="flex w-fit items-center gap-1 bg-muted-foreground pl-1 pr-2 text-xs font-medium text-background"
								>
									<ChevronRight
										class={twMerge('size-3 transition', open ? 'rotate-90 transform' : '')}
									/>
									JSON
								</span>
							{/snippet}
							<Codemirror
								class=" max-h-[75vh] overflow-auto text-left"
								lang={json()}
								lineWrapping
								value={JSON.stringify(candidate, null, 2)}
								readonly
							/>
						</Accordion>
					</div>
				</Accordion>
			</div>
		{/each}

		{#if orderedCandidates.length === 0}
			<p>No candidates found for this advertisement.</p>
		{/if}
	</div>
</div>

<!-- <Codemirror
	class=" max-h-[75vh] overflow-auto text-left"
	lang={json()}
	lineWrapping
	value={JSON.stringify(richCandidates, null, 2)}
	readonly
/> -->
