<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/app-sidebar/app-sidebar.svelte';
	import { getAuthState, setAuthState } from '$lib/api/auth.svelte';
	import '../app.css';
	import Header from '../lib/components/header/header.svelte';
	import { isRouteProtected } from './protected.config';
	import { goto } from '$app/navigation';
	import { withBase } from '$lib/utils';
	import { page } from '$app/stores';
	import ToastsContainer from '$lib/components/toasts/toasts-container.svelte';
	let { children } = $props();

	setAuthState();

	const auth = getAuthState();
	$effect.pre(() => {
		if (!isRouteProtected($page.url.pathname)) return;
		if (!auth.loading && !auth.currentUser) {
			goto(withBase(`/login?redirect=${$page.url.pathname}${$page.url.search}`));
		}
	});
</script>

<Sidebar.Provider class="h-screen">
	<AppSidebar />
	<main class="flex h-fit min-h-full w-full flex-col">
		<Header />
		<div class="flex flex-1 flex-col p-1 sm:p-4 sm:pb-0">
			{@render children()}
		</div>
	</main>
</Sidebar.Provider>

<ToastsContainer />
