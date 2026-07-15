<script lang="ts">
	import { tick } from 'svelte';
	import { useId } from 'bits-ui';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { METHODS, type Method, type Query } from '../query';

	const methods: Method[] = Object.values(METHODS);

	let open = $state(false);
	let { query = $bindable(), disabled = false }: { query: Query; disabled?: boolean } = $props();

	const selectedMethod = $derived(methods.find((s) => s.value === query.method));

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
	const triggerId = useId();
</script>

<div class="flex items-center">
	<Popover.Root bind:open>
		<Popover.Trigger
			id={triggerId}
			class={buttonVariants({
				variant: 'ghost',
				size: 'sm',
				class: 'h-8 w-fit justify-start rounded-md px-2 text-sm font-medium hover:bg-muted'
			})}
			{disabled}
		>
			{#if selectedMethod}
				{selectedMethod.label}
			{:else}
				Select a filter
			{/if}
		</Popover.Trigger>
		<Popover.Content
			class="min-w-52 rounded-xl border-border p-1 shadow-sm"
			side="bottom"
			align="start"
		>
			<Command.Root>
				<Command.Input placeholder="Filter method..." class="h-9 text-sm" />
				<Command.List>
					<Command.Empty>No results found.</Command.Empty>
					<Command.Group>
						{#each methods as currentMethod (currentMethod.value)}
							<Command.Item
								value={currentMethod.value}
								class="text-sm"
								onSelect={() => {
									// If the inputType are incompatible, reset the args
									if (currentMethod.inputType !== selectedMethod?.inputType) {
										query.args = [];
									}
									query.method = currentMethod.value;
									closeAndFocusTrigger(triggerId);
								}}
							>
								<span>
									{currentMethod.label}
								</span>
							</Command.Item>
						{/each}
						<hr class="my-1 border-t border-border" />
						<Command.Item
							value=""
							class="text-sm text-muted-foreground"
							onSelect={() => {
								query.method = '';
								closeAndFocusTrigger(triggerId);
							}}
						>
							<span> Clear </span>
						</Command.Item>
					</Command.Group>
				</Command.List>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
</div>
