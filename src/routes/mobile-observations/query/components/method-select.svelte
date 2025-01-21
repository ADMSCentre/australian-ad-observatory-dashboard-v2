<script lang="ts">
	import Circle from 'lucide-svelte/icons/circle';
	import CircleArrowUp from 'lucide-svelte/icons/circle-arrow-up';
	import CircleCheck from 'lucide-svelte/icons/circle-check';
	import CircleHelp from 'lucide-svelte/icons/circle-help';
	import CircleX from 'lucide-svelte/icons/circle-x';
	import { type ComponentType, tick } from 'svelte';
	import { useId } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { METHODS, type Method } from '../const';
	import { Icon } from 'lucide-svelte';

	const statuses: Method[] = Object.values(METHODS);

	let open = $state(false);
	let { value = $bindable() }: { value: string } = $props();

	const selectedStatus = $derived(statuses.find((s) => s.value === value));

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

<div class="flex items-center space-x-4">
	<Popover.Root bind:open>
		<Popover.Trigger
			id={triggerId}
			class={buttonVariants({
				variant: 'ghost',
				size: 'sm',
				class: 'size-fit justify-start px-0'
			})}
		>
			{#if selectedStatus}
				{selectedStatus.label}
			{:else}
				Method
			{/if}
		</Popover.Trigger>
		<Popover.Content class="w-40 p-0" side="bottom" align="start">
			<Command.Root>
				<Command.Input placeholder="Filter method..." />
				<Command.List>
					<Command.Empty>No results found.</Command.Empty>
					<Command.Group>
						{#each statuses as status}
							<Command.Item
								value={status.value}
								onSelect={() => {
									value = status.value;
									closeAndFocusTrigger(triggerId);
								}}
							>
								<span>
									{status.label}
								</span>
							</Command.Item>
						{/each}
						<hr class="my-2 border-t" />
						<Command.Item
							value=""
							onSelect={() => {
								value = '';
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
