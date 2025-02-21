<script lang="ts">
	import { PROJECT_MANAGER, ProjectManager } from 'mobile-observations/projects/manager.svelte';
	import { getContext } from 'svelte';
	import { Plus } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import type { QueryCell, TextCell } from 'mobile-observations/projects/types';
	import { DEFAULT_QUERY } from 'mobile-observations/query/query';
	import { twMerge } from 'tailwind-merge';
	import { session } from '$lib/api/session/session.svelte';

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
			id: Math.random().toString(36).substring(7),
			type: 'text',
			content: ''
		};
		projectManager.insertCell(newCell, index);
		projectManager.update();
	};

	const insertQueryCell = () => {
		const newCell: QueryCell = {
			id: Math.random().toString(36).substring(7),
			type: 'query',
			content: {
				query: DEFAULT_QUERY,
				results: []
			}
		};
		projectManager.insertCell(newCell, index);
		projectManager.update();
	};
</script>

<div class={twMerge('flex gap-2', className)}>
	<Button variant="outline" size="sm" class="size-fit px-2 py-1" onclick={insertTextCell}>
		<Plus /> Text
	</Button>
	<Button variant="outline" size="sm" class="size-fit px-2 py-1" onclick={insertQueryCell}>
		<Plus /> Query
	</Button>
</div>
