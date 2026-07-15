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
		<Dialog.Content class="flex max-w-lg flex-col gap-y-5 rounded-xl">
			<h2 class="flex items-center gap-2 text-xl font-semibold tracking-normal">
				<ConstructionIcon class="size-5 text-warning" />
				Maintenance Notice
			</h2>
			<p class="text-sm leading-6 text-muted-foreground">
				The system is currently undergoing a scheduled maintenance. You can continue to use the
				dashboard, but some features may not work as expected, and your work may not be saved until
				the maintenance is complete.
			</p>
			<div
				class="flex flex-col items-center gap-2 rounded-xl border border-warning/20 bg-warning/10 p-4 text-warning/90"
			>
				<span class="w-full text-xs font-semibold uppercase tracking-widest text-warning/80">
					Time remaining
				</span>
				<Timer
					class="select-none text-2xl text-warning/90"
					exp={currentMaintenance.endDate.getTime()}
				/>
			</div>
			<div class="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-6">
				<strong class="font-semibold text-foreground">Maintenance details</strong>
				<ul class="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
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
