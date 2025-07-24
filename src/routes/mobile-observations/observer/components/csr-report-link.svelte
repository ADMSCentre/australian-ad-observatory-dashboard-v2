<script lang="ts">
	import { auth } from '$lib/api/auth/auth.svelte';
	import { client } from '$lib/api/client';
	import Button from '$lib/components/ui/button/button.svelte';
	import { ArrowUpRightFromSquareIcon, CircleHelpIcon, DownloadIcon } from 'lucide-svelte';
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

<div class="flex h-full w-fit items-center gap-2 rounded border px-4 py-2 shadow">
	{#await getCsrReportLink()}
		<p>Loading CSR report link...</p>
	{:then result}
		{#if result.status === 'success'}
			<p>CSR available:</p>
			<Button
				href={result.url}
				target="_blank"
				class="h-fit p-2"
				variant="link"
				rel="noopener noreferrer"
			>
				<ArrowUpRightFromSquareIcon />
				View
			</Button>
		{:else}
			<p class="text-red-500">{result.message}</p>
		{/if}
	{:catch error}
		<p class="text-red-500">Error fetching CSR report link: {error.message}</p>
	{/await}
	<Tooltip.Root>
		<Tooltip.Trigger>
			<CircleHelpIcon class="size-4" />
		</Tooltip.Trigger>
		<Tooltip.Content class="max-w-sm">
			{'The CSR (Comprehensive Statistical Report) report summarises the mobile device activity of the participant in the context of their involvement within the data donation study.'}
		</Tooltip.Content>
	</Tooltip.Root>
</div>
