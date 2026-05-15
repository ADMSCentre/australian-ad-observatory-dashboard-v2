<script lang="ts">
	import { session } from '$lib/api/session/session.svelte';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { ConstructionIcon } from 'lucide-svelte';

	const latestMaintenance = $derived(session.maintenances.last);
	const isFuture = $derived.by(() => {
		if (!latestMaintenance.startDate || !latestMaintenance.endDate) return false;
		const now = new Date();
		return now < latestMaintenance.endDate;
	});

	function formatDate(date: Date): string {
		return date
			? new Date(date).toLocaleDateString('en-AU', {
					weekday: 'short',
					year: 'numeric',
					month: 'short',
					day: 'numeric',
					hour: 'numeric',
					hour12: true
				})
			: 'No date available';
	}
</script>

{#if latestMaintenance && isFuture}
	<Alert.Root
		variant="warning"
		class="rounded-xl border-amber-200 bg-amber-50/80 text-sm text-amber-950 shadow-none"
	>
		<Alert.Title class="flex items-center justify-between gap-3 text-sm font-semibold">
			Maintenance Notice
			<ConstructionIcon class="size-4 shrink-0 text-amber-700" />
		</Alert.Title>
		<div class="mt-2 flex flex-col gap-1.5 text-xs leading-5 text-amber-900/90">
			<p class="leading-5">
				A scheduled maintenance is coming up. Please avoid using the dashboard during the period
				stated below.
			</p>
			<p>
				<strong>Start:</strong>
				{formatDate(latestMaintenance.startDate)}
			</p>
			{#if latestMaintenance.endDate}
				<p>
					<strong>End:</strong>
					{formatDate(latestMaintenance.endDate)}
				</p>
			{/if}
		</div>
	</Alert.Root>
{/if}
