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
	import { ChevronDownIcon, ClipboardCopyIcon, ClipboardPasteIcon, PlusIcon } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let {
		options,
		selected = $bindable([]),
		searchable = false,
		clearable = false,
		disabled = false,
		allowPasting = false,
		placeholder = 'Select options...',
		contentClass = '',
		// Controls whether searches, comparisons and pasted values are treated as case-sensitive.
		// true = case-sensitive; false = case-insensitive (normalizes to lower-case for matching)
		caseSensitive = true,
		onSelected
	}: {
		options: { value: any; label: string }[];
		selected?: any[];
		disabled?: boolean;
		placeholder?: string;
		searchable?: boolean;
		clearable?: boolean;
		allowPasting?: boolean;
		contentClass?: string;
		caseSensitive?: boolean;
		onSelected?: (value: any[]) => void;
	} = $props();

	let open = $state(false);
	let inputRef = $state<HTMLInputElement>(null!);
	let searchTerm = $state('');

	// Note: compute unselected options after isSelected/normalizeForCompare are defined

	// Allow pasting options from clipboard
	async function parseClipboard(): Promise<string[]> {
		if (!allowPasting) return [];
		if (!navigator.clipboard || !navigator.clipboard.readText) {
			console.warn('Clipboard API not supported');
			return [];
		}
		try {
			const text = await navigator.clipboard.readText();
			const SEPARATORS = [',', ';', '\n'];
			const regex = new RegExp(`\\s*[${SEPARATORS.join('')}]+\\s*`);
			return (
				text
					.split(regex)
					.filter((item) => item.trim() !== '')
					// Remove quotes
					.map((i) => i.replaceAll('"', '').replaceAll("'", ''))
					.map((i) => (caseSensitive ? i : i.toLocaleLowerCase()))
					.map((i) => i.trim())
			);
		} catch (error) {
			console.warn('Failed to read clipboard contents:', error);
			return [];
		}
	}

	function normalise(value: any) {
		if (typeof value === 'string') return caseSensitive ? value : value.toLocaleLowerCase();
		return value;
	}

	function isSelected(value: any) {
		return selected.some((s) => normalise(s) === normalise(value));
	}

	function toggleSelection(value: any) {
		if (isSelected(value)) {
			selected = selected.filter((v) => normalise(v) !== normalise(value));
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
		selected = selected.filter((v) => normalise(v) !== normalise(value));
		onSelected?.(selected);
	}

	// Find the unselected options using normalized comparison
	const unselectedOptions = $derived(
		options.filter((option) => !selected.some((s) => normalise(s) === normalise(option.value)))
	);

	// Filter options shown in the list based on search term and case-sensitive toggle
	const filteredOptions = $derived.by(() => {
		searchTerm;
		return options
			.filter((option) => {
				if (!searchTerm || searchTerm.trim() === '') return true;
				const term =
					typeof searchTerm === 'string'
						? caseSensitive
							? searchTerm
							: searchTerm.toLocaleLowerCase()
						: searchTerm;
				const label =
					typeof option.label === 'string'
						? caseSensitive
							? option.label
							: option.label.toLocaleLowerCase()
						: option.label;
				return typeof label === 'string' && label.includes(term as string);
			})
			.slice(0, 100); // Limit to first 100 results
	});

	$inspect({
		searchTerm,
		filteredOptions
	});
</script>

<Popover.Root bind:open>
	<Popover.Trigger
		class="cursor-auto"
		onclick={(e) => {
			tick().then(() => {
				inputRef.focus();
			});
		}}
		{disabled}
	>
		<div class="flex items-center justify-between gap-2 rounded-md border border-border p-2">
			<div class="flex w-full flex-col gap-2">
				{#if selected.length > 0}
					<div class="flex flex-wrap gap-2">
						{#each selected as value}
							{@const option = options.find(
								(option) => normalise(option.value) === normalise(value)
							)}
							<MultiSelectItem
								option={option || { value, label: value }}
								onRemove={removeSelection}
								class={twMerge(!option && 'bg-red-500/10 text-destructive')}
								{disabled}
							/>
						{/each}
					</div>
				{/if}
				{#if selected.length === 0}
					<div class="w-full text-left text-sm text-muted-foreground">
						{placeholder}
					</div>
				{/if}
				<div class="flex w-fit items-center gap-2">
					{#if clearable && selected.length > 0 && !disabled}
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
								Clear ({selected.length} item{selected.length > 1 ? 's' : ''})
							</Button>
						</div>
					{/if}
					<!-- Copy button -->
					<Button
						variant="ghost"
						class="size-fit px-1 py-0.5 text-xs font-medium"
						onclick={async (e) => {
							e.stopPropagation();
							const items = selected.map((value) => {
								const match = options.find(
									(o) =>
										normalise(o.value) === normalise(value) ||
										normalise(o.label) === normalise(value)
								);
								return match ? match.label : value;
							});
							try {
								await navigator.clipboard.writeText(items.join(', '));
							} catch (error) {
								console.warn('Failed to write to clipboard:', error);
								toast.error('Failed to copy to clipboard.');
								return;
							}
							toast.success(
								`Copy ${items.length} item${items.length > 1 ? 's' : ''} to clipboard.`
							);
						}}
					>
						<ClipboardCopyIcon class="size-4" />
						Copy
					</Button>
					{#if allowPasting && !disabled}
						<Button
							variant="ghost"
							class="size-fit px-1 py-0.5 text-xs font-medium"
							onclick={async (e) => {
								e.stopPropagation();
								const rawItems = (await parseClipboard()).filter((i) => i.trim() !== '');
								const items = rawItems.map((i) => {
									const match = options.find(
										(o) =>
											normalise(o.value) === normalise(i) || normalise(o.label) === normalise(i)
									);
									return match ? match.value : i;
								});
								const newItems = items.filter((item) => !isSelected(item));
								if (newItems.length > 0) {
									selected = [...selected, ...newItems];
									onSelected?.(selected);
								}
								toast.success(
									`Pasted ${items.length} item${items.length > 1 ? 's' : ''} (${newItems.length} new) from clipboard.`
								);
							}}
						>
							<ClipboardPasteIcon class="size-4" />
							Paste
						</Button>
					{/if}
				</div>
			</div>
			{#if !disabled}
				<ChevronDownIcon size={20} />
			{/if}
		</div>
		<Popover.Content
			onOpenAutoFocus={(e) => e.preventDefault()}
			class={twMerge('p-0', contentClass)}
		>
			<Command.Root shouldFilter={false}>
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
					<!-- Enable user to add terms not included in the list -->
					{#if searchTerm.trimEnd() !== '' && !filteredOptions.some((o) => normalise(o.value) === normalise(searchTerm) || normalise(o.label) === normalise(searchTerm))}
						<Command.Group>
							<Command.Item
								value={searchTerm}
								keywords={caseSensitive
									? [searchTerm]
									: [searchTerm, searchTerm.toLocaleLowerCase()]}
								onSelect={() => {
									if (searchTerm.trim() !== '') {
										const match = options.find(
											(o) =>
												normalise(o.value) === normalise(searchTerm) ||
												normalise(o.label) === normalise(searchTerm)
										);
										toggleSelection(match ? match.value : searchTerm);
									}
								}}
								onclick={(e) => {
									e.stopPropagation();
									e.preventDefault();
									if (searchTerm.trim() !== '') {
										const match = options.find(
											(o) =>
												normalise(o.value) === normalise(searchTerm) ||
												normalise(o.label) === normalise(searchTerm)
										);
										toggleSelection(match ? match.value : searchTerm);
									}
								}}
							>
								<PlusIcon class="mr-2 size-4" />
								{normalise(searchTerm)}
							</Command.Item>
						</Command.Group>
					{/if}
					<!-- <Command.Empty>No results found.</Command.Empty> -->
					<Command.Group>
						{#each filteredOptions as option}
							<Command.Item
								value={option.value}
								keywords={caseSensitive
									? [option.label]
									: [option.label, option.label.toLocaleLowerCase()]}
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
								<span>{option.label}</span>
							</Command.Item>
						{/each}
						{#if clearable && selected.length > 0 && !disabled}
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
						<!-- If there are more items, show a message to state there are more and the user should search -->
						{#if unselectedOptions.length > filteredOptions.length}
							<div class="px-3 py-2 text-xs text-muted-foreground">
								{unselectedOptions.length - filteredOptions.length} more item{unselectedOptions.length -
									filteredOptions.length ===
								1
									? ''
									: 's'}. Please refine your search to see more.
							</div>
						{/if}
					</Command.Group>
				</Command.List>
			</Command.Root>
		</Popover.Content>
	</Popover.Trigger>
</Popover.Root>
