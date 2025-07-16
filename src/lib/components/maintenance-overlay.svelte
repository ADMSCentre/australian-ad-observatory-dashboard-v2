<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { session } from '$lib/api/session/session.svelte';
	import Button from './ui/button/button.svelte';
	import { ConstructionIcon } from 'lucide-svelte';
	import Timer from './timer.svelte';

	const currentMaintenance = $derived(
		session.maintenances.find((m) => {
			if (!m.startDate || !m.endDate) return false;
			const now = new Date();
			console.log('Current time:', now);
			console.log('After maintenance start:', m.startDate, now >= m.startDate);
			console.log('Before maintenance end:', m.endDate, now <= m.endDate);
			return now >= m.startDate && now <= m.endDate;
		})
	);

	function formatDate(date: Date): string {
		return date
			? new Date(date).toLocaleDateString('en-AU', {
					weekday: 'long',
					year: 'numeric',
					month: 'short',
					day: 'numeric',
					hour: 'numeric',
					hour12: true
				})
			: 'No date available';
	}
</script>

{#if currentMaintenance}
	<Dialog.Root open>
		<Dialog.Content class="flex flex-col gap-y-6">
			<h2 class="text-xl font-bold">
				<ConstructionIcon class="mr-2 inline-block" />
				Maintenance Notice
			</h2>
			<p>
				The system is currently undergoing a scheduled maintenance. You can continue to use the
				dashboard, but some features may not work as expected, and your work may not be saved until
				the maintenance is complete.
			</p>
			<div
				class="flex flex-col items-center gap-2 rounded border-l-4 border-brand bg-brand/5 p-2 text-lg"
			>
				<span class=" w-full text-xs font-light uppercase">Time remaining:</span>
				<Timer class="select-none font-bold" exp={currentMaintenance.endDate.getTime()} />
			</div>
			<div>
				<strong>Maintenance Details:</strong>
				<ul class="list-disc pl-5">
					<li><strong>Title:</strong> {currentMaintenance.title}</li>
					<li><strong>Description:</strong> {currentMaintenance.description}</li>
					<li>
						<strong>Start:</strong>
						{formatDate(currentMaintenance.startDate)}
					</li>
					{#if currentMaintenance.endDate}
						<li>
							<strong>End:</strong>
							{formatDate(currentMaintenance.endDate)}
						</li>
					{/if}
				</ul>
			</div>
			<Dialog.Close>
				<Button class="w-full">I understand and proceed</Button>
			</Dialog.Close>
		</Dialog.Content>
	</Dialog.Root>
{/if}
