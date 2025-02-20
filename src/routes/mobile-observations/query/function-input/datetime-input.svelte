<script lang="ts">
	import Input from '$lib/components/ui/input/input.svelte';
	import { untrack } from 'svelte';
	import type { Query } from '../query';
	import { getLocalTimeZone } from '@internationalized/date';

	let {
		query = $bindable(),
		inputRefs = $bindable()
	}: { query: Query; inputRefs: (HTMLInputElement | null)[] } = $props();

	// const currentTimeStamp = Math.round(new Date().getTime() / 60000) * 60000;

	const timestampToDate = (timestamp: string) => {
		const date = new Date(parseInt(timestamp));
		const dateStr = new Intl.DateTimeFormat('sv-SE', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		}).format(date);
		console.log('dateStr', dateStr);
		return dateStr;
	};

	let value = $state();

	$effect(() => {
		untrack(() => {
			if (!query.args[0]) return;
			value = timestampToDate(query.args[0] as string);
		});
	});

	const onchange = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const timestamp = new Date(target.value).getTime();
		// query.args[0] = target.value;
		query.args[0] = timestamp.toString();
	};
</script>

<input
	type="datetime-local"
	class="border-b text-sm outline-none"
	step="60"
	bind:value
	{onchange}
/>

<style>
	:global(::-webkit-calendar-picker-indicator) {
		margin-left: -1.25rem;
	}
	:global(.dark) {
		:global(::-webkit-calendar-picker-indicator) {
			color-scheme: dark;
		}
	}
</style>
