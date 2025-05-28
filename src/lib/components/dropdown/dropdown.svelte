<script lang="ts">
	import Check from 'lucide-svelte/icons/check';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import { twMerge } from 'tailwind-merge';
	import { Separator } from 'bits-ui';

	let {
		options,
		selected = $bindable(),
		disabled = false,
		searchable = false,
		clearable = false,
		placeholder = 'Select an option...',
		triggerClass = '',
		contentClass = '',
		mode = 'single',
		onSelected
	}: {
		options: { value: any; label: string }[];
		selected?: any;
		disabled?: boolean;
		placeholder?: string;
		searchable?: boolean;
		clearable?: boolean;
		triggerClass?: string;
		contentClass?: string;
		onSelected?: (value: any) => void;
		mode?: 'single' | 'multiple';
	} = $props();

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	$effect(() => {
		// Attempt to initialize the selected value if not given
		if (selected !== undefined) {
			return;
		}
		if (mode === 'single') {
			selected = null;
		}
		if (mode === 'multiple') {
			selected = [];
		}
	});

	const selectedValues = $derived.by(() => {
		if (mode === 'single') {
			return options.find((f) => f.value === selected)?.label;
		}
		if (mode === 'multiple') {
			// If no options are selected, shows the placeholder
			if (!selected || selected.length === 0) {
				return placeholder;
			}
			// If all options are selected, shows 'All'
			if (selected.length === options.length) {
				return 'All';
			}
			// Otherwise, shows the selected options as a comma-separated list
			return options
				.filter((f) => selected.includes(f.value))
				.map((f) => f.label)
				.join(', ');
		}
	});

	function isSelected(value: any) {
		if (mode === 'single') {
			return selected === value;
		}
		if (mode === 'multiple') {
			return selected.includes(value);
		}
		return false;
	}

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
				{selectedValues || placeholder}
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
				<Command.Empty>No results found.</Command.Empty>
				<Command.Group>
					{#each options as option}
						<Command.Item
							value={option.value}
							keywords={[option.label]}
							onSelect={() => {
								// selected = option.value;
								if (mode === 'single') {
									selected = option.value;
								} else if (mode === 'multiple') {
									if (isSelected(option.value)) {
										selected = (selected as any[]).filter((v) => v !== option.value);
									} else {
										selected = [...selected, option.value];
									}
								}
								closeAndFocusTrigger();
								onSelected?.(option.value);
							}}
						>
							<Check class={cn('mr-2 size-4', !isSelected(option.value) && 'text-transparent')} />
							{option.label}
						</Command.Item>
					{/each}
					{#if clearable && mode === 'multiple' && selected.length > 0}
						<Command.Separator />
						<Command.Item
							onSelect={() => {
								selected = [];
								closeAndFocusTrigger();
								onSelected?.(null);
							}}
							class="pl-10 text-destructive"
						>
							Clear selection
						</Command.Item>
					{/if}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
