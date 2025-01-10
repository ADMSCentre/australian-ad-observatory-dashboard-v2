<script lang="ts">
	import Dropdown from '$lib/components/dropdown/dropdown.svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { CircleAlert } from 'lucide-svelte';
	import { twMerge } from 'tailwind-merge';
	import { auth } from '$lib/api/auth.svelte';
	import type { User } from './types';
	import { appendUser } from './columns.svelte';
	import { client } from '$lib/api/client';
	import Markdown from 'svelte-exmarkdown';
	import { Circle } from 'svelte-loading-spinners';
	import { pushToast } from '$lib/components/toasts/toasts.svelte';
	import { theme } from '$lib/states/theme.svelte';

	const options = [
		{ value: 'admin', label: 'Admin' },
		{ value: 'user', label: 'User' }
	];
	let open = $state(false);
	let loading = $state(false);
	let message = $state<{
		type: 'error' | 'success' | 'info';
		text: string;
	}>({
		type: 'info',
		text: ''
	});

	const defaultFormData: User = {
		username: '',
		fullname: '',
		password: '',
		role: 'user'
	};

	let formData = $state<User>(defaultFormData);
	const onOpenChange = (value: boolean) => {
		open = value;
	};

	const onSubmit = async (event: Event) => {
		event.preventDefault();
		try {
			loading = true;
			await appendUser(formData);
			loading = false;
			pushToast({
				type: 'success',
				message: `User "${formData.username}" created successfully.`,
				timeout: 5000
			});

			// Reset form data
			formData = defaultFormData;
			message = {
				type: 'info',
				text: ''
			};
			onOpenChange(false);
		} catch (e: unknown) {
			console.error(e);
			loading = false;
			if (!(e instanceof Error) || !e.message) {
				message = {
					type: 'error',
					text: 'An unknown error occurred. Please try again.'
				};
				return;
			}
			message = {
				type: 'error',
				text: (e as Error).message
			};
		}
	};
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Trigger class={buttonVariants({ variant: 'default' })}>+ Create User</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[425px]">
		<form onsubmit={onSubmit} class="space-y-2">
			<Dialog.Header>
				<Dialog.Title>Create New User</Dialog.Title>
				<Dialog.Description>
					Enter the user's details below and click "Create" to create a new user.
				</Dialog.Description>
			</Dialog.Header>
			<div class="grid gap-4 py-4">
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="username" class="text-right">Username</Label>
					<Input id="username" bind:value={formData.username} class="col-span-3" required />
				</div>
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="fullname" class="text-right">Full Name</Label>
					<Input id="fullname" bind:value={formData.fullname} class="col-span-3" required />
				</div>
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="password" class="text-right">Password</Label>
					<Input
						id="password"
						type="password"
						bind:value={formData.password}
						class="col-span-3"
						required
					/>
				</div>
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="role" class="text-right">Role</Label>
					<Dropdown {options} bind:selected={formData.role} />
				</div>
			</div>
			{#if message.text}
				<Alert.Root variant={message.type === 'error' ? 'destructive' : message.type}>
					<Alert.Title>{message.type.charAt(0).toUpperCase() + message.type.slice(1)}</Alert.Title>
					<Alert.Description>
						<Markdown md={message.text} />
					</Alert.Description>
				</Alert.Root>
			{/if}
			<Dialog.Footer>
				<Button type="submit" disabled={loading} class="w-20">
					{#if loading}
						<Circle size="20" color={theme.colors.background} />
					{:else}
						Create
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
