<script lang="ts">
	import Check from 'lucide-svelte/icons/check';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import { twMerge } from 'tailwind-merge';

	let {
		options,
		selected = $bindable(''),
		disabled = false,
		searchable = false,
		triggerClass = '',
		contentClass = '',
		onSelected
	}: {
		options: { value: any; label: string }[];
		selected?: any;
		disabled?: boolean;
		searchable?: boolean;
		triggerClass?: string;
		contentClass?: string;
		onSelected?: (value: any) => void;
	} = $props();

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	const selectedValue = $derived(options.find((f) => f.value === selected)?.label);

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
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
				class={twMerge('w-[200px] justify-between', triggerClass)}
				{...props}
				role="combobox"
				aria-expanded={open}
				{disabled}
			>
				{selectedValue || 'Select an option...'}
				<ChevronsUpDown class="ml-2 size-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class={twMerge('w-[200px] p-0', contentClass)}>
		<Command.Root>
			{#if searchable}
				<Command.Input placeholder="Search option..." />
			{/if}
			<Command.List>
				<Command.Empty>No framework found.</Command.Empty>
				<Command.Group>
					{#each options as option}
						<Command.Item
							value={option.value}
							onSelect={() => {
								selected = option.value;
								closeAndFocusTrigger();
								onSelected?.(option.value);
							}}
						>
							<Check class={cn('mr-2 size-4', selected !== option.value && 'text-transparent')} />
							{option.label}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
