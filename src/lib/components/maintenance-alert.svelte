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
	<Alert.Root variant="warning" class="text-sm">
		<Alert.Title class="flex items-center justify-between gap-2">
			Maintenance Notice
			<ConstructionIcon class="size-4" />
		</Alert.Title>
		<div class="flex flex-col gap-1 text-xs">
			<p>
				A scheduled maintenance is coming up. Please avoid using the dashboard during this time.
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
