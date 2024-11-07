<script lang="ts">
	import { getAuthState } from '$lib/api/auth.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Circle } from 'svelte-loading-spinners';

	const auth = getAuthState();

	const onLogout = () => {
		auth.logout();
	};
</script>

<header
	class="sticky top-0 z-50 flex w-full items-center border-b bg-white bg-opacity-50 p-2 backdrop-blur-sm"
>
	<div class="flex w-full items-center justify-between">
		<Sidebar.Trigger />
		<div class="flex items-center gap-4">
			<!-- {#if auth.currentUser && !auth.loading}
				<p>Hello <span class=" font-semibold">{auth.currentUser.username}</span>!</p>
				<Button variant="outline" type="button" onclick={onLogout}>Logout</Button>
			{:else if !auth.loading}
				<Button variant="outline" href="/login">Login</Button>
			{:else}
				<Circle size="30" color="black" />
			{/if} -->
			{#if auth.loading}
				<Circle size="30" color="black" />
			{:else if auth.currentUser}
				<p>Hello <span class=" font-semibold">{auth.currentUser.username}</span>!</p>
				<Button variant="outline" type="button" onclick={onLogout}>Logout</Button>
			{:else}
				<Button variant="outline" href="/login">Login</Button>
			{/if}
		</div>
	</div>
</header>
