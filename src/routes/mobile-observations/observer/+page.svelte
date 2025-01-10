<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import {
		ArrowLeft,
		ChevronLeftSquare,
		ChevronRightSquare,
		CircleAlert,
		Presentation,
		Share2,
		Square
	} from 'lucide-svelte/icons';
	import { listAdsForObserver } from '$lib/api/mobile-observations';
	import { auth } from '$lib/api/auth.svelte';
	import { Circle } from 'svelte-loading-spinners';
	import type { RichAdData } from '../types';
	import AdsBrowser from '../components/ads-browser.svelte';
	import ObservationsTimeline from '../components/observations-timeline.svelte';
	import { withBase } from '$lib/utils';
	import { twMerge } from 'tailwind-merge';
	import { theme } from '$lib/states/theme.svelte';
	import { client } from '$lib/api/client';
	import { goto } from '$app/navigation';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import CopyButton from '$lib/components/copy-button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';

	const participantId = $page.url.searchParams.get('observer_id') || '';
	const pageUrl = $page.url.href;

	let ads = $state<RichAdData[]>([]);
	let isPresenting = $state(true);
	let isToolboxOpen = $state(true);
	const filters = $derived.by(() => {
		if (!isPresenting) return [];
		return [(ad: RichAdData) => !ad.attributes?.hidden?.value];
	});

	const fetchAdsIndex = async () => {
		if (!auth.token) return [];
		return await listAdsForObserver(auth.token, participantId);
	};

	$effect(() => {
		(async () => {
			ads = await fetchAdsIndex();
		})();
	});

	let guestSessionToken = $state<string | null>(null);
	const createGuestSession = async () => {
		const { data, error } = await client.POST('/guests', {
			body: {
				key: participantId,
				expiration_time: 60 * 60, // 1 hour
				description: `Guest session for observer ${participantId}`
			},
			headers: {
				Authorization: `Bearer ${auth.token}`
			}
		});
	};

	const deleteGuestSession = async () => {
		const { data, error } = await client.DELETE('/guests/{key}', {
			params: {
				path: {
					key: participantId
				}
			},
			headers: {
				Authorization: `Bearer ${auth.token}`
			}
		});
	};

	const checkGuestSession = async () => {
		const { data, error } = await client.GET('/guests/{key}', {
			params: {
				path: {
					key: participantId
				}
			}
		});
		if (error || !data.success) {
			return null;
		}
		return data.token || null;
	};

	$effect.pre(() => {
		(async () => {
			guestSessionToken = await checkGuestSession();
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
	{#if !auth.isGuest}
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
			<Dialog.Root>
				<Dialog.Trigger>
					<Button size="icon" variant={guestSessionToken ? 'destructive' : 'outline'}>
						<Share2 />
					</Button>
				</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title>Share report</Dialog.Title>
						<div class="flex flex-col gap-2">
							{#if guestSessionToken}
								<p>Share this report with others by providing them with the following link.</p>
								<Alert.Root variant="destructive">
									<CircleAlert class="size-4" />
									<Alert.Title>Caution!</Alert.Title>
									<Alert.Description>
										Anyone on the internet with the link will have access to this report.
									</Alert.Description>
								</Alert.Root>
								<div class="flex w-full items-center gap-2">
									<Input type="text" value={`${pageUrl}`} readonly />
									<CopyButton text={pageUrl} />
								</div>
								<Button
									onclick={() => {
										deleteGuestSession()
											.then(checkGuestSession)
											.then((token) => {
												guestSessionToken = token;
											});
									}}
									variant="destructive"
								>
									Deactivate Session
								</Button>
							{:else}
								<p>
									No shareable link available. Click "Create Session" to start a sharing session.
								</p>
								<Alert.Root variant="warning">
									<CircleAlert class="size-4" />
									<Alert.Title>Warning!</Alert.Title>
									<Alert.Description>
										After the session is created, anyone on the internet with the link will have
										access to this report.
									</Alert.Description>
								</Alert.Root>
								<Button
									onclick={() => {
										createGuestSession()
											.then(checkGuestSession)
											.then((token) => {
												guestSessionToken = token;
											});
									}}
								>
									Create Session
								</Button>
							{/if}
						</div>
					</Dialog.Header>
				</Dialog.Content>
			</Dialog.Root>
		</div>
	{/if}

	<!-- Main content -->
	<h1>{participantId}</h1>
	<!-- <ObserverOverview observerId={participantId} /> -->
	{#if !ads || ads.length === 0}
		<div class="flex size-full items-center justify-center">
			<Circle size="200" color={theme.colors.foreground} />
		</div>
	{:else}
		<ObservationsTimeline {ads} />
		<AdsBrowser
			bind:ads
			{filters}
			open
			cardOptions={{
				showObserver: false
			}}
		/>
	{/if}
</div>
