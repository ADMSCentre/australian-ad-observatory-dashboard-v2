<script lang="ts">
	import { getAuthState } from '$lib/api/auth.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { twMerge } from 'tailwind-merge';
	import { Circle } from 'svelte-loading-spinners';
	import { withBase } from '$lib/utils';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Markdown } from 'svelte-exmarkdown';

	let username = $state('');
	let password = $state('');
	let message = $state({
		value: '',
		kind: 'error'
	});
	let loading = $state(false);
	const auth = getAuthState();

	const redirect = $page.url.searchParams.get('redirect') || withBase('/');
	$effect(() => {
		if (redirect !== '/') {
			message = {
				value: `Please login to access [${redirect}](${redirect})`,
				kind: 'info'
			};
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault(); // No page reload (to keep params)
		loading = true;
		if (username === '' || password === '') {
			message = {
				value: 'Username and password are required.',
				kind: 'error'
			};
			loading = false;
			return;
		}
		try {
			await auth.login({ username, password });
			message = {
				value: `Successfully logged in as ${username}`,
				kind: 'success'
			};
			loading = false;
			goto(redirect);
		} catch (error) {
			message = {
				value: (error as Error).message,
				kind: 'error'
			};
			loading = false;
		}
	}
</script>

<div class="flex size-full flex-1 items-center justify-center bg-gray-100">
	<div class="w-full max-w-sm rounded bg-white p-8 shadow-md">
		<h2 class="mb-6 text-center text-2xl font-bold">Login</h2>
		{#if message.value}
			<div class={twMerge('relative mb-4 rounded border px-4 py-3', message.kind)} role="alert">
				<!-- <span class="block sm:inline">{message.value}</span> -->
				<Markdown md={message.value} />
			</div>
		{/if}
		<form onsubmit={handleSubmit}>
			<div class="mb-4">
				<label class="mb-2 block text-sm font-bold text-gray-700" for="username">Username</label>
				<input
					class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
					id="username"
					type="text"
					bind:value={username}
				/>
			</div>
			<div class="mb-6">
				<label class="mb-2 block text-sm font-bold text-gray-700" for="password">Password</label>
				<input
					class="focus:shadow-outline mb-3 w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
					id="password"
					type="password"
					bind:value={password}
				/>
			</div>
			<div class="flex h-10 items-center justify-between">
				{#if loading}
					<Button class="size-full" disabled>
						<Circle unit="px" size="20" color="white" />
					</Button>
				{:else}
					<Button class="size-full" type="submit">Login</Button>
				{/if}
			</div>
		</form>
	</div>
</div>

<style>
	.error {
		@apply border-red-400 bg-red-100 text-red-700;
	}
	.success {
		@apply border-green-400 bg-green-100 text-green-700;
	}
	.info {
		@apply border-blue-400 bg-blue-100 text-blue-700;
	}
	a {
		@apply underline;
	}
</style>
