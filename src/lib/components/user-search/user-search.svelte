<script lang="ts">
	import { UserPlus } from 'lucide-svelte';
	import { tick } from 'svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import type { User } from '$lib/api/session/users/index.svelte';

	let {
		users,
		selected = $bindable(),
		disabled = false,
		placeholder = 'Select a user...',
		triggerClass = '',
		contentClass = '',
		onSelected
	}: {
		users: User[];
		selected?: string | null;
		disabled?: boolean;
		placeholder?: string;
		triggerClass?: string;
		contentClass?: string;
		onSelected?: (value: string) => void;
	} = $props();

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	const selectedLabel = $derived.by(() => {
		if (!selected) return placeholder;
		const user = users.find((u) => u.username === selected);
		if (!user) return placeholder;
		return `${user.fullname || user.username} (${user.username})`;
	});

	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger bind:ref={triggerRef}>
		{#snippet child({ props })}
			<Button
				variant="outline"
				class={cn(
					'h-9 w-full justify-between gap-2 rounded-md border-border bg-background px-3 text-left text-sm font-normal shadow-none hover:border-amber-300',
					triggerClass
				)}
				{...props}
				role="combobox"
				aria-expanded={open}
				{disabled}
			>
				<span class="truncate text-left">{selectedLabel}</span>
				<UserPlus class="ml-2 size-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class={cn('w-72 rounded-xl border-border p-1 shadow-sm', contentClass)}>
		<Command.Root>
			<Command.Input placeholder="Search users..." class="h-9 text-sm" />
			<Command.List>
				<Command.Empty>No users found.</Command.Empty>
				<Command.Group>
					{#each users as user (user.username)}
						<Command.Item
							value={user.username}
							keywords={[user.fullname, user.username]}
							class="text-sm"
							onSelect={() => {
								selected = user.username;
								closeAndFocusTrigger();
								onSelected?.(user.username);
							}}
						>
							<div class="flex flex-col">
								<span class="font-medium">{user.fullname || user.username}</span>
								<span class="text-xs text-muted-foreground">{user.username}</span>
							</div>
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
