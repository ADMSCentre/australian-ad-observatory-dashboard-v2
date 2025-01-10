<script lang="ts">
	import { auth } from '$lib/api/auth/auth.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Circle } from 'svelte-loading-spinners';
	import { toggleLightMode, theme } from '$lib/states/theme.svelte';
	import { Sun, Moon } from 'lucide-svelte/icons';

	const onLogout = () => {
		auth.logout();
	};

	import { onMount } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import { withBase } from '$lib/utils';

	let lastScrollTop = $state(0);
	let headerVisible = $state(true);

	onMount(() => {
		const handleScroll = () => {
			const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
			headerVisible = scrollTop < lastScrollTop || scrollTop <= 0;
			lastScrollTop = scrollTop;
		};

		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

{#snippet themeModeSwitch()}
	<button
		onclick={toggleLightMode}
		class={twMerge('flex w-16 flex-row items-center rounded-full border-2 p-1 transition-all')}
	>
		<div
			class={twMerge(
				'flex flex-1 justify-end transition-all',
				theme.mode === 'light' && 'flex-none'
			)}
		>
			<span
				class="flex size-6 cursor-pointer items-center justify-center rounded-full border-none bg-background p-1"
			>
				{#if theme.mode === 'light'}
					<Sun class="text-foreground" />
				{:else}
					<Moon class="text-foreground" />
				{/if}
			</span>
		</div>
	</button>
{/snippet}

<header
	class={twMerge(
		'sticky top-0 z-50 flex w-full items-center border-b bg-background bg-opacity-50 p-2 text-foreground backdrop-blur-sm transition duration-300',
		!headerVisible && ' -translate-y-full transform'
	)}
>
	<div class="flex w-full items-center justify-between">
		<span>
			{#if !auth.isGuest}
				<Sidebar.Trigger />
			{/if}
		</span>
		<div class="flex items-center gap-4">
			{@render themeModeSwitch()}

			{#if auth.loading}
				<div class="flex items-center gap-2">
					<Circle size="30" color={theme.colors.foreground} />
					<span> Authenticating... </span>
				</div>
			{:else if auth.currentUser}
				{#if !auth.isGuest}
					<p>Hello <span class=" font-semibold">{auth.currentUser.full_name}</span>!</p>
					<Button variant="outline" type="button" onclick={onLogout}>Logout</Button>
				{/if}
			{:else}
				<Button variant="outline" href={withBase('login')}>Login</Button>
			{/if}
		</div>
	</div>
</header>
