<script lang="ts">
	import { PROJECT_MANAGER, ProjectManager } from 'mobile-observations/projects/manager.svelte';
	import { getContext } from 'svelte';
	import { Plus } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import type { QueryCell, TextCell } from 'mobile-observations/projects/types';
	import { DEFAULT_QUERY } from 'mobile-observations/query/query';
	import { twMerge } from 'tailwind-merge';
	import { v4 as uuid } from 'uuid';

	const {
		class: className = '',
		index
	}: {
		class?: string;
		index: number;
	} = $props();

	const projectManager = (getContext(PROJECT_MANAGER) as () => ProjectManager | undefined)();
	if (!projectManager)
		throw new Error(
			'Project Manager not found. This component must be rendered inside a ProjectPage component.'
		);

	const insertTextCell = () => {
		const newCell: TextCell = {
			id: uuid(),
			type: 'text',
			content: ''
		};
		projectManager.insertCell(newCell, index);
	};

	const insertQueryCell = () => {
		const newCell: QueryCell = {
			id: uuid(),
			type: 'query',
			content: {
				query: DEFAULT_QUERY,
				results: []
			}
		};
		projectManager.insertCell(newCell, index);
	};
</script>

<div class={twMerge('flex flex-wrap items-center justify-center gap-2', className)}>
	{#if projectManager.currentUser.isEditor}
		<Button
			variant="outline"
			size="sm"
			class="h-8 gap-1.5 rounded-full px-3 text-xs"
			onclick={insertTextCell}
		>
			<Plus class="size-3.5" /> Text
		</Button>
		<Button
			variant="outline"
			size="sm"
			class="h-8 gap-1.5 rounded-full px-3 text-xs"
			onclick={insertQueryCell}
		>
			<Plus class="size-3.5" /> Query
		</Button>
	{:else}
		<span class="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
			You need to be an editor to add cells
		</span>
	{/if}
</div>
