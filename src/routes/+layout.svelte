<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/app-sidebar/app-sidebar.svelte';
	import { setAuthState } from '$lib/api/auth.svelte';
	import '../app.css';
	import Header from '../lib/components/header/header.svelte';
	let { children } = $props();

	setAuthState();
</script>

<Sidebar.Provider class="h-screen">
	<AppSidebar />
	<main class="flex size-full flex-col">
		<Header />
		<div class="flex-1">
			{@render children()}
		</div>
	</main>
</Sidebar.Provider>
