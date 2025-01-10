<script lang="ts">
	import { auth } from '$lib/api/auth.svelte';
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
	<div class="w-full max-w-sm rounded bg-background p-8 shadow-md">
		<h2 class="mb-6 text-center text-2xl font-bold">Login</h2>
		{#if message.text}
			<!-- <div
				class={twMerge('relative mb-4 rounded border !bg-opacity-15 px-4 py-3', message.type)}
				role="alert"
			>
				<span class="block sm:inline">{message.value}</span>
				<Markdown md={message.text} />
			</div> -->
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
	</div>
</div>
