<script lang="ts">
	import { FIELD_GROUPS } from '$lib/api/session/ads/rdo-helper';
	import Accordion from '$lib/components/accordion/accordion.svelte';
	import { ChevronRight } from 'lucide-svelte';
	import { untrack } from 'svelte';
	import { slide } from 'svelte/transition';
	import { twMerge } from 'tailwind-merge';

	let {
		allKeys,
		selectedKeys = $bindable()
	}: {
		allKeys: string[];
		selectedKeys: string[];
	} = $props();

	let keys = $state<{
		[key: string]: boolean;
	}>({});

	$effect(() => {
		allKeys;
		selectedKeys;
		untrack(() => {
			// keys = allKeys.reduce(
			// 	(acc, key) => {
			// 		acc[key] = selectedKeys.includes(key);
			// 		return acc;
			// 	},
			// 	{} as { [key: string]: boolean }
			// );
			keys = {
				...allKeys.reduce<{ [key: string]: boolean }>((acc, key) => {
					acc[key] = false;
					return acc;
				}, {}),
				...selectedKeys.reduce<{ [key: string]: boolean }>((acc, key) => {
					acc[key] = true;
					return acc;
				}, {})
			};
		});
	});

	const otherFields = $derived.by(() => {
		const groupedFields = FIELD_GROUPS.reduce((acc, group) => {
			group.fields.forEach((field) => {
				acc.push(field.key);
			});
			return acc;
		}, [] as string[]);
		return Object.entries(keys).filter(([key]) => !groupedFields.includes(key));
	});

	const toggleKey = (key: string) => {
		keys[key] = !keys[key];
		selectedKeys = Object.entries(keys)
			.filter(([key, value]) => value)
			.map(([key]) => key);
	};
</script>

<div class="flex flex-col gap-4">
	{#each FIELD_GROUPS as group}
		<Accordion class="flex flex-col gap-4" open={group.open}>
			{#snippet summary(open)}
				<span class="flex items-center gap-2 border-b text-left font-semibold">
					<ChevronRight class={twMerge('transition-transform', open && 'rotate-90 transform')} />
					{group.name}
				</span>
			{/snippet}
			<div class="flex flex-wrap gap-x-4 gap-y-2" transition:slide={{ duration: 200 }}>
				{#each group.fields as field}
					<label class="flex items-center gap-1">
						<input
							type="checkbox"
							checked={keys[field.key]}
							onchange={() => toggleKey(field.key)}
						/>
						<span>{field.title}</span>
					</label>
				{/each}
			</div>
		</Accordion>
	{/each}
	<Accordion class="flex flex-col gap-4">
		{#snippet summary(open)}
			<span class="flex items-center gap-2 border-b text-left font-semibold">
				<ChevronRight class={twMerge('transition-transform', open && 'rotate-90 transform')} />
				Other Fields
			</span>
		{/snippet}
		<div class="flex flex-wrap gap-x-4 gap-y-2" transition:slide={{ duration: 200 }}>
			{#each otherFields as [key]}
				<label class="flex items-center gap-1">
					<input type="checkbox" checked={keys[key]} onchange={() => toggleKey(key)} />
					<span>{key}</span>
				</label>
			{/each}
		</div>
	</Accordion>
</div>
