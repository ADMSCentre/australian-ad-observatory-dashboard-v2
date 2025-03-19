<script lang="ts">
	import {
		Play,
		ArrowUpFromLine,
		ArrowDownFromLine,
		Trash,
		X,
		Check,
		LoaderCircle
	} from 'lucide-svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { twMerge } from 'tailwind-merge';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { Cell } from 'mobile-observations/projects/types';
	import { getContext } from 'svelte';
	import { PROJECT_MANAGER, ProjectManager } from 'mobile-observations/projects/manager.svelte';

	const {
		class: className,
		cell
	}: {
		class: string;
		cell: Cell;
	} = $props();

	const projectManager = (getContext(PROJECT_MANAGER) as () => ProjectManager | undefined)();
	if (!projectManager)
		throw new Error(
			'Project Manager not found. This component must be rendered inside a ProjectPage component.'
		);

	let isDeleting = $state(false);
	$inspect({ cell, projectManager });
	const queryResult = $derived(projectManager.queryResults[cell.id]);
</script>

{#snippet actionButton(props: { iconComponent: any; tooltip: string; onclick: () => void })}
	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger>
				<Button variant="ghost" size="icon" class="size-fit p-1" onclick={props.onclick}>
					<props.iconComponent />
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content>{props.tooltip}</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>
{/snippet}

{#if projectManager}
	<div class={twMerge('flex gap-1 border bg-background p-1', className)}>
		{#if !isDeleting}
			{#if cell.type === 'query'}
				{#if !queryResult || !queryResult.loading}
					{@render actionButton({
						iconComponent: Play,
						tooltip: 'Run',
						onclick: async () => await projectManager.runCell(cell.id)
					})}
				{:else}
					<Button disabled variant="ghost" size="icon" class="size-fit p-1">
						<LoaderCircle class="animate-spin" />
					</Button>
				{/if}
			{/if}
			{@render actionButton({
				iconComponent: ArrowUpFromLine,
				tooltip: 'Shift Cell Up',
				onclick: () => projectManager.shiftCellUp(cell.id)
			})}
			{@render actionButton({
				iconComponent: ArrowDownFromLine,
				tooltip: 'Shift Cell Down',
				onclick: () => projectManager.shiftCellDown(cell.id)
			})}
			{@render actionButton({
				iconComponent: Trash,
				tooltip: 'Delete Cell',
				onclick: () => (isDeleting = true)
			})}
		{:else}
			<Button variant="ghost" size="icon" class="size-fit p-1" onclick={() => (isDeleting = false)}>
				<X />
			</Button>
			<Button
				variant="destructive"
				size="icon"
				class="size-fit p-1"
				onclick={() => {
					projectManager.popCell(cell.id);
					projectManager.update();
				}}
			>
				<Trash />
			</Button>
		{/if}
	</div>
{/if}
