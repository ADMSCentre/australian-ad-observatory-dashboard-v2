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
		stripWhitespaces = false,
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
		stripWhitespaces?: boolean;
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
		if (typeof value === 'string') {
			const stripped = stripWhitespaces ? value.trim() : value;
			return caseSensitive ? stripped : stripped.toLocaleLowerCase();
		}
		return value;
	}

	function strip(value: any) {
		return stripWhitespaces && typeof value === 'string' ? value.trim() : value;
	}

	function isSelected(value: any) {
		return selected.some((s) => normalise(s) === normalise(value));
	}

	function toggleSelection(value: any) {
		value = strip(value);
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
		value = strip(value);
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
				const term = normalise(searchTerm);
				const label = normalise(option.label);
				return typeof label === 'string' && label.includes(term as string);
			})
			.slice(0, 100); // Limit to first 100 results
	});

	const searchValue = $derived(strip(searchTerm));

	function selectSearchValue() {
		if (searchValue.trim() === '') return;
		const match = options.find(
			(o) =>
				normalise(o.value) === normalise(searchValue) ||
				normalise(o.label) === normalise(searchValue)
		);
		toggleSelection(match ? match.value : searchValue);
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
		{disabled}
	>
		<div
			class="flex min-h-10 items-center justify-between gap-3 rounded-lg border border-border bg-background p-2 text-sm shadow-none transition-colors duration-200 hover:border-brand/20"
		>
			<div class="flex min-w-0 flex-1 flex-col gap-2">
				{#if selected.length > 0}
					<div class="flex flex-wrap gap-2">
						{#each selected as value (normalise(value))}
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
				<div class="flex w-fit flex-wrap items-center gap-1.5">
					{#if clearable && selected.length > 0 && !disabled}
						<div class="flex w-full items-center gap-2 sm:w-auto">
							<Button
								variant="ghost"
								class="size-fit h-7 px-2 py-0.5 text-xs font-medium text-muted-foreground hover:text-foreground"
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
						class="size-fit h-7 px-2 py-0.5 text-xs font-medium text-muted-foreground hover:text-foreground"
						aria-label="Copy selected items"
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
							class="size-fit h-7 px-2 py-0.5 text-xs font-medium text-muted-foreground hover:text-foreground"
							aria-label="Paste items from clipboard"
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
				<ChevronDownIcon class="size-4 shrink-0 text-muted-foreground" />
			{/if}
		</div>
		<Popover.Content
			onOpenAutoFocus={(e) => e.preventDefault()}
			class={twMerge('rounded-xl border-border p-1 shadow-sm', contentClass)}
		>
			<Command.Root shouldFilter={false}>
				{#if searchable}
					<Command.Input
						class="h-9 w-full text-sm"
						placeholder="Select an option..."
						bind:ref={inputRef}
						minlength={1}
						bind:value={searchTerm}
					/>
				{/if}
				<Command.List>
					<!-- Enable user to add terms not included in the list -->
					{#if searchValue.trimEnd() !== '' && !filteredOptions.some((o) => normalise(o.value) === normalise(searchValue) || normalise(o.label) === normalise(searchValue))}
						<Command.Group>
							<Command.Item
								value={searchValue}
								keywords={caseSensitive
									? [searchValue]
									: [searchValue, searchValue.toLocaleLowerCase()]}
								class="text-sm"
								onSelect={selectSearchValue}
								onclick={(e) => {
									e.stopPropagation();
									e.preventDefault();
									selectSearchValue();
								}}
							>
								<PlusIcon class="mr-2 size-4" />
								{normalise(searchValue)}
							</Command.Item>
						</Command.Group>
					{/if}
					<!-- <Command.Empty>No results found.</Command.Empty> -->
					<Command.Group>
						{#each filteredOptions as option (normalise(option.value))}
							{@const label = strip(option.label)}
							<Command.Item
								value={strip(option.value)}
								keywords={caseSensitive ? [label] : [label, label.toLocaleLowerCase()]}
								class="text-sm"
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
								<span class="truncate">{label}</span>
							</Command.Item>
						{/each}
						{#if clearable && selected.length > 0 && !disabled}
							<Command.Item
								value="clear"
								class="text-sm text-destructive"
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
