<script lang="ts">
	import { auth } from '$lib/api/auth/auth.svelte';
	import { client } from '$lib/api/client';
	import { ArrowUpRightFromSquareIcon, CircleHelpIcon } from 'lucide-svelte';
	import { getObserverPageContext } from '../context.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';

	const context = getObserverPageContext();

	async function getCsrReportLink(): Promise<
		| {
				status: 'error';
				message: string;
		  }
		| {
				status: 'success';
				url: string;
		  }
	> {
		const { data, error } = await client.GET('/observers/{observer_id}/csr', {
			headers: {
				Authorization: `Bearer ${auth.token}`
			},
			params: {
				path: {
					observer_id: context.observerId
				}
			}
		});
		if (error) {
			return { status: 'error', message: error?.comment || 'Failed to fetch CSR report link' };
		}
		if (!data.presign_url) {
			return { status: 'error', message: 'No CSR report available' };
		}
		return { status: 'success', url: data.presign_url };
	}
</script>

<div class="flex items-center gap-2">
	{#await getCsrReportLink()}
		<span class="text-sm text-muted-foreground">Loading CSR...</span>
	{:then result}
		{#if result.status === 'success'}
			<a
				href={result.url}
				target="_blank"
				rel="noopener noreferrer"
				class="text-primary hover:underline"
			>
				CSR Report
				<ArrowUpRightFromSquareIcon class="inline size-4" />
			</a>
		{:else}
			<span class="text-sm text-muted-foreground">{result.message}</span>
		{/if}
	{:catch error}
		<span class="text-sm text-muted-foreground">CSR unavailable</span>
	{/await}
	<Tooltip.Root>
		<Tooltip.Trigger class="inline-flex h-fit rounded hover:bg-muted/50 p-1">
			<CircleHelpIcon class="size-4 text-muted-foreground" />
		</Tooltip.Trigger>
		<Tooltip.Content class="max-w-sm">
			{'The CSR (Comprehensive Statistical Report) summarises the mobile device activity of the participant in the data donation study.'}
		</Tooltip.Content>
	</Tooltip.Root>
</div>
