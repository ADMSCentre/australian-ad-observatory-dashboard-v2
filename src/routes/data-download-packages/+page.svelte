<script lang="ts">
	import { dataDonationApi } from '$lib/api/data-donation/index.svelte';
	import AgGrid from '$lib/components/ag-grid/ag-grid.svelte';
	import PageLoader from '$lib/components/page-loader/page-loader.svelte';
	import { withBase } from '$lib/utils';
	import { onMount } from 'svelte';

	onMount(() => {
		dataDonationApi.fetch();
	});

	interface DonationRowData {
		donor: string;
		date: string;
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
					date: new Date(donation.timestamp * 1000).toLocaleDateString('en-GB', {
						year: 'numeric',
						month: 'short',
						day: '2-digit',
						hour: '2-digit',
						minute: '2-digit'
					}),
					timestamp: donation.timestamp,
					platform: donation.platform,
					numFiles: donation.files.length
				}));
			})
			.flat();
	});

	const agGridColumns = $derived([
		{ field: 'donor', headerName: 'Donor Code' },
		{ field: 'date', headerName: 'Date' },
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
	<PageLoader />
{/if}

{#if !loading}
	<AgGrid columnDefs={agGridColumns} rowData={agGridRows} class="h-96" />
{/if}
