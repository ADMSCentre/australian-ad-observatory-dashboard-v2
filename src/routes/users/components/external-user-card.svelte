<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import type { ExternalUser } from './external-users-context.svelte';
	import { getExternalUserContext } from './external-users-context.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { CheckIcon, TrashIcon } from 'lucide-svelte';
	import * as Dialog from '$lib/components/ui/dialog';

	const { user }: { user: ExternalUser } = $props();
	const context = getExternalUserContext();

	const createdAt = new Date(user.created_at * 1000).toLocaleTimeString('en-AU', {
		day: '2-digit',
		month: 'long',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		weekday: 'long',
		hour12: false
	});
</script>

<Card.Root class="w-full max-w-sm text-sm">
	<Card.Header>
		<Card.Title class="flex items-center justify-between">
			<span>{user.full_name || 'No name provided'}</span>
			<Badge variant={user.enabled ? 'default' : 'secondary'}>
				{user.enabled ? 'Approved' : 'Pending Approval'}
			</Badge>
		</Card.Title>
		<Card.Description>{user.email || 'No email'}</Card.Description>
	</Card.Header>
	<Card.Content class="grid gap-2">
		<div>
			<strong>Role:</strong>
			<Badge variant="outline">{user.role}</Badge>
		</div>
		<div>
			<strong>Joined:</strong>
			{createdAt}
		</div>
	</Card.Content>
	<Card.Footer class="flex justify-end gap-2">
		{#if !user.enabled}
			<Button onclick={() => context.approve(user)}>
				<CheckIcon />
				Approve
			</Button>
		{:else}
			<Button variant="secondary" onclick={() => context.disable(user)}>Disapprove</Button>
		{/if}
		<Dialog.Root>
			<Dialog.Trigger>
				<Button variant="destructive-outline">
					<TrashIcon />
					Delete
				</Button>
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Are you sure?</Dialog.Title>
					<Dialog.Description>
						This action cannot be undone. This will permanently delete the user account.
					</Dialog.Description>
				</Dialog.Header>
				<Dialog.Footer>
					<Dialog.Close>
						<Button variant="outline">Cancel</Button>
					</Dialog.Close>
					<Button variant="destructive" onclick={() => context.delete(user)}>Confirm Delete</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	</Card.Footer>
</Card.Root>
