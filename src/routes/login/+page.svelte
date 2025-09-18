<script lang="ts">
	import { auth } from '$lib/api/auth/auth.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { twMerge } from 'tailwind-merge';
	import { Circle } from 'svelte-loading-spinners';
	import { withBase } from '$lib/utils';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Markdown } from 'svelte-exmarkdown';
	import { theme } from '$lib/states/theme.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import CilogonButton from '$lib/components/cilogon-button.svelte';
	import { CircleHelpIcon } from 'lucide-svelte';
	import FlaggedFeature from '$lib/components/flagged-feature/flagged-feature.svelte';
	import { session } from '$lib/api/session/session.svelte';

	let username = $state('');
	let password = $state('');
	let message = $state<{
		text: string;
		type: 'error' | 'info' | 'success';
	}>({
		text: '',
		type: 'error'
	});
	let loading = $state(false);

	const redirect = $page.url.searchParams.get('redirect') || withBase('/');
	$effect(() => {
		if (redirect !== '/') {
			message = {
				text: `Please login to access [${redirect}](${redirect})`,
				type: 'info'
			};
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault(); // No page reload (to keep params)
		loading = true;
		if (username === '' || password === '') {
			message = {
				text: 'Username and password are required.',
				type: 'error'
			};
			loading = false;
			return;
		}
		try {
			await auth.login({ username, password });
			await session.refresh();
			message = {
				text: `Successfully logged in as ${username}`,
				type: 'success'
			};
			loading = false;
			goto(redirect);
		} catch (error) {
			message = {
				text: (error as Error).message,
				type: 'error'
			};
			loading = false;
		}
	}
</script>

<div class="flex size-full flex-1 items-center justify-center bg-muted">
	<div class="flex w-full max-w-sm flex-col gap-4 rounded bg-background p-8 shadow-md">
		<h2 class="text-center text-2xl font-bold">Login</h2>
		<p class="text-center text-xs text-muted-foreground">
			Please enter the credentials provided by the Australian Ad Observatory team to access the
			dashboard.
		</p>
		{#if message.text}
			<Alert.Root variant={message.type === 'error' ? 'destructive' : message.type}>
				<Alert.Title>{message.type.charAt(0).toUpperCase() + message.type.slice(1)}</Alert.Title>
				<Alert.Description>
					<Markdown md={message.text} />
				</Alert.Description>
			</Alert.Root>
		{/if}
		<form onsubmit={handleSubmit}>
			<div class="mb-4">
				<label class="mb-2 block text-sm font-bold text-foreground" for="username">Username</label>
				<Input id="username" type="text" bind:value={username} />
			</div>
			<div class="mb-6">
				<label class="mb-2 block text-sm font-bold text-foreground" for="password">Password</label>
				<Input id="password" type="password" bind:value={password} />
			</div>
			<div class="flex h-10 items-center justify-between">
				{#if loading}
					<Button class="size-full" disabled>
						<Circle unit="px" size="20" color={theme.colors.foreground} />
					</Button>
				{:else}
					<Button class="size-full" type="submit">Login</Button>
				{/if}
			</div>
		</form>

		<!-- Alternative methods -->
		<div class="grid grid-cols-1 gap-2">
			<div class="relative text-center">
				<span class="relative z-10 bg-background px-4 text-sm text-muted-foreground">OR</span>
				<hr class="absolute top-1/2 z-0 w-full" />
			</div>
			<FlaggedFeature feature="cilogon">
				<CilogonButton class="mt-2 w-full">
					Login with an external account
					<Tooltip.Root>
						<Tooltip.Trigger>
							<CircleHelpIcon />
						</Tooltip.Trigger>
						<Tooltip.Content>
							<p class="max-w-sm text-wrap text-left text-xs font-normal text-muted-foreground">
								Login using an external account (e.g., Google, Microsoft or your institution's
								account). You will be redirected to the CILogon service to authenticate. Your
								account will require approval by the Australian Ad Observatory team before you can
								access the dashboard.
							</p>
						</Tooltip.Content>
					</Tooltip.Root>
				</CilogonButton>
				{#snippet alternative()}
					<Button variant="outline" class="w-full" disabled>Login with an external account</Button>
				{/snippet}
			</FlaggedFeature>
		</div>
	</div>
</div>
