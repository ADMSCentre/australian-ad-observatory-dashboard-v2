<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import Button from '$lib/components/ui/button/button.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Dropdown from '$lib/components/dropdown/dropdown.svelte';
	import { session } from '$lib/api/session/session.svelte';
	import { auth } from '$lib/api/auth/auth.svelte';
	import { exportsManager } from '../exports.svelte';
	import { pushToast } from '$lib/components/toasts/toasts.svelte';
	import type { Export } from '../types';
	import { X, UserPlus, LoaderCircle } from 'lucide-svelte';
	import * as HoverCard from '$lib/components/ui/hover-card';

	let {
		open = $bindable(false),
		exportItem,
		onClose
	}: {
		open: boolean;
		exportItem: Export;
		onClose: () => void;
	} = $props();

	let selectedUserId = $state<string | null>(null);
	let loading = $state(false);

	// Get users that are not already shared with
	const availableUsers = $derived.by(() => {
		return session.users.all.filter((user) => {
			// Exclude the creator
			if (user.id === currentExport.creator_id) return false;
			// Exclude already shared users
			if (currentExport.shared_with.includes(user.id)) return false;
			// Exclude current user
			if (user.id === auth.currentUser?.sub) return false;
			return true;
		});
	});

	const getUserDisplayName = (userId: string): string => {
		const user = session.users.all.find((u) => u.id === userId);
		return user?.fullname || user?.username || userId.slice(0, 8) + '...';
	};

	const handleAddUser = async () => {
		if (!selectedUserId) return;

		loading = true;
		try {
			const result = await exportsManager.shareExport(exportItem.export_id, [selectedUserId]);
			if (result.success) {
				pushToast({ type: 'success', message: 'User added successfully', timeout: 3000 });
				selectedUserId = null;
			} else {
				pushToast({ type: 'error', message: result.error || 'Failed to add user', timeout: 5000 });
			}
		} finally {
			loading = false;
		}
	};

	const handleRemoveUser = async (userId: string) => {
		loading = true;
		try {
			const result = await exportsManager.unshareExport(exportItem.export_id, [userId]);
			if (result.success) {
				pushToast({ type: 'success', message: 'User removed successfully', timeout: 3000 });
			} else {
				pushToast({
					type: 'error',
					message: result.error || 'Failed to remove user',
					timeout: 5000
				});
			}
		} finally {
			loading = false;
		}
	};

	const handleClose = () => {
		open = false;
		onClose();
	};

	// Get the current export data (may have been updated)
	const currentExport = $derived.by(() => {
		return exportsManager.getExportById(exportItem.export_id) || exportItem;
	});
</script>

<Dialog.Root bind:open onOpenChange={(isOpen) => !isOpen && handleClose()}>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>Manage Access</Dialog.Title>
			<Dialog.Description>
				Share this export with other users. They will be able to view and download the export.
			</Dialog.Description>
		</Dialog.Header>

		<div class="flex flex-col gap-4 py-4">
			<!-- Add user section -->
			<div class="flex flex-col gap-2">
				<span class="text-sm font-medium">Add User</span>
				<div class="flex gap-2">
					<Dropdown
						bind:selected={selectedUserId}
						options={availableUsers.map((user) => ({
							label: `${user.fullname || user.username} (${user.username})`,
							value: user.id
						}))}
						onSelected={handleAddUser}
						placeholder="Select a user..."
						searchable
						triggerClass="flex-1"
						disabled={loading}
					/>
					<Button size="icon" onclick={handleAddUser} variant="ghost" disabled>
						{#if loading}
							<LoaderCircle class="size-4 animate-spin" />
						{/if}
					</Button>
				</div>
			</div>

			<!-- Shared with section -->
			<div class="flex flex-col gap-2">
				<span class="text-sm font-medium">
					Shared With ({currentExport.shared_with.length})
				</span>

				{#if currentExport.shared_with.length === 0}
					<p class="text-sm text-muted-foreground">This export is not shared with anyone yet.</p>
				{:else}
					<div class="flex flex-wrap gap-2">
						{#each currentExport.shared_with as userId (userId)}
							<Badge variant="secondary" class="flex items-center gap-1 pr-1">
								<HoverCard.Root>
									<HoverCard.Trigger class="no-underline">
										<span class="font-medium">{getUserDisplayName(userId)}</span>
									</HoverCard.Trigger>
									<HoverCard.Content>
										<div class="flex flex-col p-2">
											<span class="font-medium">{getUserDisplayName(userId)}</span>
											<span class="text-sm text-muted-foreground">
												{session.users.all.find((u) => u.id === userId)?.username || 'Unknown'}
											</span>
										</div>
									</HoverCard.Content>
								</HoverCard.Root>
								<button
									class="ml-1 rounded-full p-0.5 hover:bg-muted"
									onclick={() => handleRemoveUser(userId)}
									disabled={loading}
								>
									<X class="size-3" />
								</button>
							</Badge>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={handleClose}>Done</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
