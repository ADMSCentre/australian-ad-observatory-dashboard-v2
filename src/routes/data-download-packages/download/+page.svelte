<script lang="ts">
	// Get the donor, platform and timestamp from the URL parameters
	import { page } from '$app/stores';
	import {
		dataDonationApi,
		Donor,
		DownloadableDonation
	} from '$lib/api/data-donation/index.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Loader2Icon } from 'lucide-svelte';

	const donorId = $derived($page.url.searchParams.get('donor') || '');
	const platform = $derived($page.url.searchParams.get('platform') || '');
	const timestamp = $derived(+($page.url.searchParams.get('timestamp') || '0'));

	const donor = $derived(new Donor(donorId));
	let target = $state<DownloadableDonation | null>(null);

	$effect(() => {
		(async () => {
			await donor.getDonations();
			const _donation = donor.donations.find(
				(d) => d.platform === platform && d.timestamp === timestamp
			);
			if (!_donation) {
				target = null;
				return;
			}
			target = await dataDonationApi.asDownloadableDonation(donorId, _donation);
			target.download();
		})();
	});
</script>

<p class="text-sm text-muted-foreground">
	{#if !target}
		<Loader2Icon class="inline animate-spin" />
	{/if}
	Preparing the data download package for donor <strong>{donorId}</strong> on platform
	<strong>{platform}</strong>
	with timestamp <strong>{new Date(timestamp * 1000).toLocaleString()}</strong>...
</p>

{#if target}
	<p class="text-sm text-muted-foreground">
		If the download does not start automatically, you can click the button below to download the
		data package manually.
	</p>
	<Button onclick={() => target?.download()} class="w-fit">Download Data Package</Button>
{/if}
