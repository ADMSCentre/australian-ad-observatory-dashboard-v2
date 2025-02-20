<script lang="ts">
	import Tiptap from '$lib/components/tiptap.svelte';
	import type { Project } from '../types';

	let { project = $bindable() }: { project: Project } = $props();
</script>

<div class="flex flex-col gap-4 sm:flex-row sm:justify-between sm:gap-20">
	<div class="flex w-full flex-1 flex-col gap-4">
		<h1 class="text-4xl font-bold">{project.name}</h1>
		<Tiptap class="rounded border p-4 " bind:value={project.description}></Tiptap>
	</div>

	<div class="flex flex-col gap-2 border px-8 py-4 shadow-sm">
		<h2 class=" text-xl font-semibold">Team Members</h2>
		<ul class=" list-inside list-disc">
			{#each project.team as member}
				<li>{member.username} - {member.role}</li>
			{/each}
		</ul>
	</div>
</div>
