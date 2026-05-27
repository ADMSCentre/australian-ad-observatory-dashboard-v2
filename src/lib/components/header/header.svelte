<script lang="ts">
	import { auth } from '$lib/api/auth/auth.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Circle } from 'svelte-loading-spinners';
	import { toggleLightMode, theme } from '$lib/states/theme.svelte';
	import { Sun, Moon } from 'lucide-svelte/icons';
	import { onMount } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import { withBase } from '$lib/utils';
	import { page } from '$app/stores';
	import GuestTimer from '../guest-timer.svelte';
	import AppLogos from '../app-logos.svelte';

	const onLogout = () => {
		auth.logout();
	};

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
		aria-label="Toggle theme"
		class={twMerge(
			'flex h-8 w-16 flex-row items-center rounded-full border border-border bg-muted/60 p-1 transition-all duration-200 hover:border-brand/20'
		)}
	>
		<div
			class={twMerge(
				'flex flex-1 justify-end transition-all',
				theme.mode === 'light' && 'flex-none'
			)}
		>
			<span
				class="flex size-6 cursor-pointer items-center justify-center rounded-full border border-border bg-background p-1 shadow-sm"
			>
				{#if theme.mode === 'light'}
					<Sun class="size-4 text-brand" />
				{:else}
					<Moon class="size-4 text-foreground" />
				{/if}
			</span>
		</div>
	</button>
{/snippet}

<header
	class={twMerge(
		'sticky top-0 z-50 flex w-full items-center border-b border-border/80 bg-background/90 px-3 py-2 text-foreground shadow-sm shadow-black/[0.02] backdrop-blur-sm transition duration-300 sm:px-4',
		!headerVisible && ' -translate-y-full transform'
	)}
>
	<div class="flex w-full items-center justify-between">
		<span class="inline-flex min-w-0 items-center gap-2">
			{#if !auth.isGuest}
				<Sidebar.Trigger />
			{:else}
				<GuestTimer
					class="text-foreground"
					onExpire={() => {
						location.reload();
					}}
				/>
				<AppLogos logoClass="h-10 w-auto rounded bg-slate-950 p-1" />
			{/if}
		</span>
		<div class="flex min-w-0 items-center gap-2 sm:gap-3">
			{@render themeModeSwitch()}

			{#if auth.loading}
				<div class="flex items-center gap-2 text-sm text-muted-foreground">
					<Circle size="18" color={theme.colors.foreground} />
					<span>Authenticating...</span>
				</div>
			{:else if auth.currentUser && !auth.isGuest}
				<p class="hidden max-w-72 truncate text-sm text-muted-foreground sm:block">
					Hello <span class="font-semibold text-foreground">{auth.currentUser.full_name}</span>
				</p>
				<Button variant="outline" type="button" onclick={onLogout}>Logout</Button>
			{:else}
				<Button
					variant="outline"
					href={withBase(`/login?redirect=${$page.url.pathname}${$page.url.search}`)}>Login</Button
				>
			{/if}
		</div>
	</div>
</header>
