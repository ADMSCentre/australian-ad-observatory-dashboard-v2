<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import {
		AlertCircleIcon,
		ArrowLeft,
		ArrowUpRightFromSquareIcon,
		ChevronLeftSquare,
		ChevronRightSquare,
		Presentation,
		Square
	} from 'lucide-svelte/icons';
	import { auth } from '$lib/api/auth/auth.svelte';
	import { Circle } from 'svelte-loading-spinners';
	import type { RichAdData } from '$lib/api/session/ads/types';
	import AdsBrowser from '../components/ads-browser.svelte';
	import ObservationsTimeline from '../components/observations-timeline.svelte';
	import { withBase } from '$lib/utils';
	import { twMerge } from 'tailwind-merge';
	import { theme } from '$lib/states/theme.svelte';
	import { goto } from '$app/navigation';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { guestSessions } from '$lib/api/auth/guest-sessions.svelte';
	import ShareSessionForm from './components/share-session-form.svelte';
	import { session } from '$lib/api/session/session.svelte';
	import parseActivationCode from '$lib/utils/parse-activation-code';
	import { setObserverPageContext } from './context.svelte';
	import CsrReportLink from './components/csr-report-link.svelte';
	import { onMount } from 'svelte';

	const participantId = $page.url.searchParams.get('observer_id') || '';
	const pageUrl = $page.url.href;
	const guestKey = $derived(`mobile-observer-${participantId}`);

	setObserverPageContext(participantId);

	let ads = $state<RichAdData[] | null>(null);
	let isPresenting = $state(true);
	let isToolboxOpen = $state(true);
	const filters = $derived.by(() => {
		if (!isPresenting) return [];
		return [(ad: RichAdData) => !ad.attributes?.hidden?.value];
	});

	onMount(async () => {
		ads = await session.ads.getByObserver(participantId);
	});

	let guestSessionToken = $state<string | null>(null);
	const syncGuestToken = async () => {
		guestSessionToken = await guestSessions.getToken(guestKey);
	};

	$effect.pre(() => {
		(async () => {
			await syncGuestToken();
			if (!auth.loading && !auth.currentUser && !guestSessionToken) {
				goto(withBase(`/login?redirect=${$page.url.pathname}${$page.url.search}`));
			}
			if (auth.currentUser) {
				isPresenting = false;
				return;
			}
			if (guestSessionToken) {
				// Login using the guest session
				auth.token = guestSessionToken;
			}
		})();
	});
</script>

<!-- Back button -->

<div class="flex flex-col gap-4">
	{#if !auth.isGuest}
		<div class="flex justify-between">
			<Button href={withBase('/mobile-observations')}>
				<ArrowLeft />
				Back
			</Button>
		</div>
	{/if}

	<!-- Toolbox -->
	{#if auth.token && !auth.isGuest}
		<div
			class={twMerge(
				'fixed bottom-2 right-2 z-40 flex w-fit items-center gap-2 border bg-background bg-opacity-50 px-4 py-2 shadow backdrop-blur-sm transition-all',
				isToolboxOpen ? 'translate-x-0' : 'translate-x-full'
			)}
		>
			<button
				onclick={() => (isToolboxOpen = !isToolboxOpen)}
				class="absolute left-0 -mr-2 -translate-x-1/2 rounded bg-background"
			>
				{#if isToolboxOpen}
					<ChevronRightSquare />
				{:else}
					<ChevronLeftSquare />
				{/if}
			</button>
			<Button
				onclick={() => (isPresenting = !isPresenting)}
				variant={isPresenting ? 'destructive' : 'outline'}
			>
				{#if isPresenting}
					<Square />
					Exit Presentation
				{:else}
					<Presentation />
					Present
				{/if}
			</Button>
			<ShareSessionForm {guestKey} currentPageUrl={pageUrl} bind:guestSessionToken />
		</div>
	{/if}

	<!-- Main content -->
	<div class="flex items-center justify-between">
		<h1 class="font-normal">
			<span> Activation Code: </span>
			<span class="rounded border-primary bg-brand/60 px-2 py-1 font-medium text-primary">
				{parseActivationCode(participantId)?.toLocaleUpperCase()}
			</span>
		</h1>
		<div class="flex items-center gap-6 rounded border px-4 py-2 shadow">
			<a
				href={`http://ad-observatory-workshop-2025.s3-website-ap-southeast-2.amazonaws.com/observers/${participantId}`}
				class="text-primary hover:underline"
				target="_blank"
				rel="noopener noreferrer"
			>
				Sequence Visualiser
				<ArrowUpRightFromSquareIcon class="inline size-4" />
			</a>
			<CsrReportLink />
		</div>
	</div>

	<p class="text-muted-foreground">
		The observations collected by this observer are shown below. The activation code corresponds to
		the code found on the <a
			href="https://play.google.com/store/apps/details?id=com.adms.australianmobileadtoolkit&hl=en_AU"
			class="text-primary underline"
			target="_blank"
			rel="noopener noreferrer"
		>
			Australian Mobile Ad Toolkit
		</a>
	</p>

	<!-- <ObserverOverview observerId={participantId} /> -->
	{#if ads === null}
		<div class="flex size-full items-center justify-center">
			<Circle size="200" color={theme.colors.foreground} />
		</div>
	{:else if ads.length === 0}
		<Alert.Root class="w-fit">
			<AlertCircleIcon class="size-5" />
			<Alert.Title>No data!</Alert.Title>
			<Alert.Description>
				This observer is registered, but no observations have been collected yet.
			</Alert.Description>
		</Alert.Root>
	{:else}
		<ObservationsTimeline {ads} />
		<AdsBrowser
			bind:ads
			{filters}
			cardOptions={{
				exclude: ['observer']
			}}
		/>
	{/if}
</div>
