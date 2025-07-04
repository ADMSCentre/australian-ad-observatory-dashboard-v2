<script lang="ts">
	import { dataDonationApi } from '$lib/api/data-donation/index.svelte';
	import AgGrid from '$lib/components/ag-grid/ag-grid.svelte';
	import PageLoader from '$lib/components/page-loader/page-loader.svelte';
	import { Button } from '$lib/components/ui/button';
	import { withBase } from '$lib/utils';
	import JSZip from 'jszip';
	import { DownloadIcon, Loader2Icon, LoaderIcon } from 'lucide-svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		dataDonationApi.fetch();
	});

	interface DonationRowData {
		donor: string;
		date: Date;
		timestamp: number;
		platform: string;
		numFiles: number;
	}

	const loading = $derived(
		dataDonationApi.status === 'loading' ||
			dataDonationApi.donors.filter((d) => d.status === 'idle').length === 0
	);

	const agGridRows = $derived.by<DonationRowData[]>(() => {
		if (dataDonationApi.status === 'loading') {
			return [];
		}
		return dataDonationApi.donors
			.filter((donor) => donor.status === 'idle')
			.map((d) => {
				return d.donations.map((donation) => ({
					donor: d.id,
					date: new Date(donation.timestamp * 1000),
					timestamp: donation.timestamp,
					platform: donation.platform,
					numFiles: donation.files.length
				}));
			})
			.flat();
	});

	const agGridColumns = $derived([
		{ field: 'donor', headerName: 'Donor Code' },
		{ field: 'date', headerName: 'Date', cellDataType: 'dateTimeString' },
		{ field: 'timestamp', headerName: 'Timestamp', hide: true },
		{ field: 'platform', headerName: 'Platform' },
		{ field: 'numFiles', headerName: 'Number of Files' },
		{
			cellRenderer: (params: { data: DonationRowData }) => {
				const donation = params.data;
				const downloadUrl = withBase(
					`data-download-packages/download?donor=${donation.donor}&platform=${donation.platform}&timestamp=${donation.timestamp}`
				);
				return `<a href="${downloadUrl}" class="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">Download</a>`;
			}
		}
	]);

	const totalDonors = $derived(dataDonationApi.donors.length);

	const completedDonors = $derived(
		dataDonationApi.donors.filter((d) => d.status === 'idle').filter((d) => d.donations.length > 0)
			.length
	);

	let preparingDownload = $state(false);

	async function downloadAllDonations() {
		const zip = new JSZip();
		preparingDownload = true;
		const promises = dataDonationApi.donors
			.filter((d) => d.status === 'idle')
			.map(async (donor) => {
				try {
					return {
						...donor,
						donations: await Promise.all(
							donor.donations.map((donation) =>
								dataDonationApi.asDownloadableDonation(donor.id, donation)
							)
						)
					};
				} catch (error) {
					console.error(`Error processing donations for donor ${donor.id}:`, error);
				}
			});
		const donorsWithDownloadableDonations = (await Promise.all(promises)).filter(
			(d) => d !== undefined
		);
		for (const donor of donorsWithDownloadableDonations) {
			// donors.addToZip(zip);
			for (const donation of donor.donations) {
				donation.addToZip(zip, donor.id);
			}
		}
		preparingDownload = false;
		const content = await zip.generateAsync({ type: 'blob' });
		const url = URL.createObjectURL(content);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'data-download-packages.zip';
		document.body.appendChild(a);
		a.click();

		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
</script>

<h1>Data Download Packages</h1>

<p class="text-muted-foreground">
	The data download packages are collected using the <a
		href="https://admscentre.github.io/ad-data-donation"
		target="_blank"
		rel="noopener noreferrer"
	>
		Ad Data Donation Platform
	</a>
	which allows users to donate ads information data obtained from selected social media platforms.
</p>

{#if loading}
	<p class="text-muted-foreground">
		<Loader2Icon class="size-42 inline animate-spin" />
		Loading data download packages...
	</p>
{/if}

{#if !loading}
	<p class="text-muted-foreground">
		Loaded data from {completedDonors} / {totalDonors} donors...
	</p>
	<AgGrid columnDefs={agGridColumns} rowData={agGridRows} class="h-96" />
	<Button onclick={downloadAllDonations} disabled={agGridRows.length === 0 || preparingDownload}>
		{#if preparingDownload}
			<LoaderIcon class="size-4 animate-spin" />
		{:else}
			<DownloadIcon class="size-4" />
		{/if}
		Download All
	</Button>
{/if}
