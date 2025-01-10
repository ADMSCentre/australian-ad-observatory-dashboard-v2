<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Check, Edit, Trash, X } from 'lucide-svelte';
	import { Footer } from '$lib/components/ui/sheet';
	import type { User } from './types';
	import { Circle } from 'svelte-loading-spinners';
	import { twMerge } from 'tailwind-merge';
	import Markdown from 'svelte-exmarkdown';
	import { theme } from '$lib/states/theme.svelte';
	import * as Alert from '$lib/components/ui/alert/index.js';

	let loading = $state<{
		loading: boolean;
		target: 'edit' | 'delete' | null;
	}>({
		loading: false,
		target: null
	});
	let message = $state<{
		text: string;
		type: 'error' | 'info' | 'success';
	}>({
		text: '',
		type: 'info'
	});

	let {
		user,
		isEditing,
		onEditStart,
		onEditConfirm,
		onEditCancel,
		onDelete
	}: {
		user: User;
		isEditing: boolean;
		onEditStart: () => void;
		onEditConfirm?: () => Promise<void>;
		onEditCancel?: () => void;
		onDelete?: () => Promise<void>;
	} = $props();

	const withLoadState =
		(fn: (() => Promise<void>) | undefined, target: 'edit' | 'delete', successMessage = '') =>
		async () => {
			loading = { loading: true, target };
			try {
				message = { text: '', type: 'info' };
				await fn?.();
				if (successMessage) message = { text: successMessage, type: 'success' };
			} catch (error) {
				if (error instanceof Error) message = { text: error.message, type: 'error' };
				else if (typeof error === 'string') message = { text: error, type: 'error' };
			} finally {
				loading = { loading: false, target: target };
			}
		};
</script>

<!-- <Edit /> -->
<div class="flex w-20 items-center gap-1">
	{#if isEditing}
		<Button
			variant="ghost"
			onclick={withLoadState(onEditConfirm, 'edit')}
			class="aspect-square p-1"
			disabled={loading.loading && loading.target === 'edit'}
		>
			{#if loading.loading && loading.target === 'edit'}
				<Circle size="20" color={theme.colors.foreground} />
			{:else}
				<Check class="size-4" />
			{/if}
		</Button>
		<Button
			variant="ghost"
			disabled={loading.loading && loading.target === 'edit'}
			onclick={onEditCancel}
			class="aspect-square p-1"
		>
			{#if loading.loading && loading.target === 'edit'}
				<Circle size="20" color={theme.colors.foreground} />
			{:else}
				<X class="size-4" />
			{/if}
		</Button>
	{:else}
		<Button variant="ghost" onclick={onEditStart} class="aspect-square p-1">
			<Edit class="size-4" />
		</Button>
	{/if}
	<Dialog.Root>
		<Dialog.Trigger>
			<Button variant="ghost" class="aspect-square p-1">
				<Trash class="size-4" />
			</Button>
		</Dialog.Trigger>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
			</Dialog.Header>
			<div>
				<p>
					Clicking the <strong>Delete</strong> button will permanently delete the user
					<span class="italic">{user.username}</span> from the system.
					<strong class="text-red-500">This action cannot be undone.</strong>
				</p>
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
				{#if !loading.loading && loading.target === 'delete'}
					<!-- Delete completed -->
					<Dialog.Close>
						<Button>Close</Button>
					</Dialog.Close>
				{:else}
					<Button
						variant={loading.target === 'delete' ? 'default' : 'destructive'}
						class="w-20"
						onclick={withLoadState(
							onDelete,
							'delete',
							'User deleted successfully. Click **Close** to return.'
						)}
					>
						{#if loading.loading && loading.target === 'delete'}
							<Circle size="20" color={theme.colors.background} />
						{:else}
							Delete
						{/if}
					</Button>
					<Dialog.Close>
						<Button variant="ghost">Cancel</Button>
					</Dialog.Close>
				{/if}
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
</div>
