<script lang="ts">
	import Check from 'lucide-svelte/icons/check';
	import X from 'lucide-svelte/icons/x';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import { twMerge } from 'tailwind-merge';
	import MultiSelectItem from './multi-select-item.svelte';
	import { ChevronDownIcon } from 'lucide-svelte';

	let {
		options,
		selected = $bindable([]),
		searchable = false,
		clearable = false,
		placeholder = 'Select options...',
		contentClass = '',
		onSelected
	}: {
		options: { value: any; label: string }[];
		selected?: any[];
		disabled?: boolean;
		placeholder?: string;
		searchable?: boolean;
		clearable?: boolean;
		contentClass?: string;
		onSelected?: (value: any[]) => void;
	} = $props();

	let open = $state(false);
	let inputRef = $state<HTMLInputElement>(null!);
	let searchTerm = $state('');

	// Find the unselected options
	const unselectedOptions = $derived(options.filter((option) => !selected.includes(option.value)));

	function isSelected(value: any) {
		return selected.includes(value);
	}

	function toggleSelection(value: any) {
		if (isSelected(value)) {
			selected = selected.filter((v) => v !== value);
		} else {
			selected = [...selected, value];
			tick().then(() => {
				searchTerm = '';
				inputRef.focus();
			});
		}
		onSelected?.(selected);
	}

	function removeSelection(value: any) {
		selected = selected.filter((v) => v !== value);
		onSelected?.(selected);
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger
		class="cursor-auto"
		onclick={(e) => {
			tick().then(() => {
				inputRef.focus();
			});
		}}
	>
		<div class="flex items-center justify-between gap-2 rounded-md border border-border p-2">
			<div class="flex w-full flex-col gap-2">
				{#if selected.length > 0}
					<div class="flex flex-wrap gap-2">
						{#each selected as value}
							{@const option = options.find((option) => option.value === value)}
							<MultiSelectItem
								option={option || { value, label: value }}
								onRemove={removeSelection}
								class={twMerge(!option && 'bg-red-500/10 text-destructive')}
							/>
						{/each}
					</div>
				{/if}
				{#if selected.length === 0}
					<div class="w-full text-left text-sm text-muted-foreground">
						{placeholder}
					</div>
				{/if}
				{#if clearable && selected.length > 0}
					<div class="flex w-full items-center gap-2">
						<Button
							variant="ghost"
							class="size-fit px-1 py-0.5 text-xs font-medium"
							onclick={(e) => {
								e.stopPropagation();
								selected = [];
								onSelected?.(selected);
							}}
						>
							<X size={16} />
							Clear selection
						</Button>
					</div>
				{/if}
			</div>
			<ChevronDownIcon size={20} />
		</div>
		<Popover.Content
			onOpenAutoFocus={(e) => e.preventDefault()}
			class={twMerge('p-0', contentClass)}
		>
			<Command.Root>
				{#if searchable}
					<Command.Input
						class="w-full"
						placeholder="Select an option..."
						bind:ref={inputRef}
						minlength={1}
						bind:value={searchTerm}
					/>
				{/if}
				<Command.List>
					<Command.Empty>No results found.</Command.Empty>
					<Command.Group>
						{#each unselectedOptions as option}
							<Command.Item
								value={option.value}
								keywords={[option.label]}
								onSelect={() => {
									toggleSelection(option.value);
								}}
								onclick={(e) => {
									e.stopPropagation();
									e.preventDefault();
									toggleSelection(option.value);
								}}
							>
								<Check class={cn('mr-2 size-4', !isSelected(option.value) && 'text-transparent')} />
								{option.label}
							</Command.Item>
						{/each}
						{#if clearable && selected.length > 0}
							<Command.Item
								value="clear"
								onSelect={() => {
									selected = [];
									onSelected?.(selected);
								}}
								onclick={(e) => {
									e.stopPropagation();
									e.preventDefault();
									selected = [];
									onSelected?.(selected);
								}}
							>
								<X class="mr-2 size-4" />
								Clear selection
							</Command.Item>
						{/if}
					</Command.Group>
				</Command.List>
			</Command.Root>
		</Popover.Content>
	</Popover.Trigger>
</Popover.Root>
