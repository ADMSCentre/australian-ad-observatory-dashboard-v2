<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/app-sidebar/app-sidebar.svelte';
	import { auth } from '$lib/api/auth/auth.svelte';
	import '../app.css';
	import Header from '../lib/components/header/header.svelte';
	import { isRouteProtected } from './protected.config';
	import { goto } from '$app/navigation';
	import { withBase } from '$lib/utils';
	import { page } from '$app/stores';
	// import ToastsContainer from '$lib/components/toasts/toasts-container.svelte';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { twMerge } from 'tailwind-merge';
	import { theme } from '$lib/states/theme.svelte';
	import { classList } from 'svelte-body';
	import { Bug } from 'lucide-svelte';
	import DebugToolbar from './debug-toolbar.svelte';
	import { version } from '$app/environment';
	import { untrack } from 'svelte';
	import { session } from '$lib/api/session/session.svelte';

	let { children } = $props();
	$effect(() => {
		if (!isRouteProtected($page.url.pathname)) return;
		if (!auth.loading && !auth.currentUser) {
			goto(withBase(`/login?redirect=${$page.url.pathname}${$page.url.search}`));
		}
		// If authentication changes, refresh the session
		untrack(() => {
			session.refresh();
		});
	});
</script>

<svelte:body use:classList={theme.mode} />

<Toaster richColors closeButton theme={theme.mode} visibleToasts={5} />

<!-- Debug utilities -->
{#if process.env.NODE_ENV === 'development'}
	<DebugToolbar />
{/if}

<Sidebar.Provider class={twMerge('min-h-screen', theme.mode)}>
	{#if !auth.isGuest}
		<AppSidebar />
	{/if}
	<main class="flex h-fit min-h-screen w-full flex-col">
		<Header />
		<div class="flex flex-1 flex-col gap-2 p-1 sm:p-4 sm:pb-0">
			{@render children()}
		</div>
		<div
			class="pointer-events-none fixed bottom-1 right-1 z-50 flex items-center justify-end text-3xs text-muted-foreground"
		>
			{process.env.NODE_ENV} build v{version}
		</div>
	</main>
</Sidebar.Provider>

<!-- <ToastsContainer /> -->
