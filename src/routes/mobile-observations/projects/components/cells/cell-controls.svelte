<script lang="ts">
	import {
		Play,
		ArrowUpFromLine,
		ArrowDownFromLine,
		Trash,
		X,
		Check,
		LoaderCircle,
		SaveIcon,
		Download
	} from 'lucide-svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { twMerge } from 'tailwind-merge';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { Cell, QueryCell } from 'mobile-observations/projects/types';
	import { getContext } from 'svelte';
	import { PROJECT_MANAGER, ProjectManager } from 'mobile-observations/projects/manager.svelte';

	const {
		class: className = '',
		cell
	}: {
		class?: string;
		cell: Cell;
	} = $props();

	const projectManager = (getContext(PROJECT_MANAGER) as () => ProjectManager | undefined)();
	if (!projectManager)
		throw new Error(
			'Project Manager not found. This component must be rendered inside a ProjectPage component.'
		);

	let isDeleting = $state(false);
	const queryResult = $derived(projectManager.queryResults[cell.id]);

	let saving = $state(false);
</script>

{#snippet actionButton(props: {
	iconComponent: any;
	classes?: {
		icon?: string;
		button?: string;
	};
	tooltip: string;
	onclick: () => void;
	disabled?: boolean;
	hidden?: boolean;
})}
	{#if !props.hidden}
		<Tooltip.Provider>
			<Tooltip.Root>
				<Tooltip.Trigger disabled={props.disabled}>
					<Button
						variant="ghost"
						size="icon"
						class={twMerge(
							'size-8 text-muted-foreground hover:text-foreground',
							props.classes?.button || ''
						)}
						onclick={props.onclick}
						disabled={props.disabled}
					>
						<props.iconComponent class={twMerge('size-4', props.classes?.icon || '')} />
					</Button>
				</Tooltip.Trigger>
				<Tooltip.Content>{props.tooltip}</Tooltip.Content>
			</Tooltip.Root>
		</Tooltip.Provider>
	{/if}
{/snippet}

{#if projectManager}
	<div class={twMerge('flex items-center gap-1', className)}>
		{#if !isDeleting}
			{#if cell.type === 'query'}
				<!-- {#if !queryResult || !queryResult.loading}
					{@render actionButton({
						iconComponent: Play,
						tooltip: 'Run',
						onclick: async () => await projectManager.runCell(cell.id)
					})}
				{:else}
					<Button disabled variant="ghost" size="icon" class="size-fit p-1">
						<LoaderCircle class="animate-spin" />
					</Button>
				{/if} -->
				{@render actionButton({
					iconComponent: queryResult?.loading ? LoaderCircle : Play,
					tooltip: 'Run',
					classes: {
						icon: queryResult?.loading ? 'animate-spin' : '',
						button: 'text-brand hover:bg-brand/10 hover:text-brand'
					},
					onclick: async () => await projectManager.runCell(cell.id),
					disabled: queryResult?.loading
				})}
			{/if}
			{@render actionButton({
				iconComponent: saving ? LoaderCircle : SaveIcon,
				classes: {
					icon: saving ? 'animate-spin' : '',
					button: cell.hasChanges ? 'text-brand hover:bg-brand/10 hover:text-brand' : ''
				},
				tooltip: 'Save',
				onclick: async () => {
					saving = true;
					await projectManager.update();
					saving = false;
					cell.hasChanges = false;
				},
				disabled: !cell.hasChanges || saving,
				hidden:
					!projectManager.currentUser.isEditor &&
					!(cell.type === 'query' && cell.content.query.method === 'OBSERVER_ID_CONTAINS')
			})}
			{#if projectManager.currentUser.isEditor}
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
			{/if}
			{#if cell.type === 'query'}
				{@render actionButton({
					iconComponent: Download,
					tooltip: 'Create Export',
					onclick: () => projectManager.startExport(cell.id)
				})}
			{/if}
			{#if projectManager.currentUser.isEditor}
				{@render actionButton({
					iconComponent: Trash,
					tooltip: 'Delete Cell',
					onclick: () => (isDeleting = true)
				})}
			{/if}
		{:else}
			<Button
				variant="ghost"
				size="icon"
				class="size-8"
				aria-label="Cancel delete"
				onclick={() => (isDeleting = false)}
			>
				<X class="size-4" />
			</Button>
			<Button
				variant="destructive"
				size="icon"
				class="size-8"
				aria-label="Confirm delete"
				onclick={() => {
					projectManager.popCell(cell.id);
					projectManager.update();
				}}
			>
				<Trash class="size-4" />
			</Button>
		{/if}
	</div>
{/if}
