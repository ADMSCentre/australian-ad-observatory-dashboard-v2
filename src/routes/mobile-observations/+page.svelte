<script lang="ts">
	import { getAuthState } from '$lib/api/auth.svelte';
	import { loginPath } from '$lib/routes.config';
	import { Circle } from 'svelte-loading-spinners';
	import ObserverOverview from './observer-overview.svelte';
	import ParticipantsTable from './participants-table.svelte';

	const auth = getAuthState();
	let loading = $state(false);
	let data = $state<{
		[key: string]: string[];
	} | null>(null);

	const fetchAdsIndex = async () => {
		if (!auth.currentUser) return;

		const url = 'https://f06kj1k332.execute-api.ap-southeast-2.amazonaws.com/dev/list-ads';
		loading = true;
		const res = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${auth.currentUser.token}`
			},
			mode: 'cors'
		});
		const responseJson = await res.json();
		const presignedUrl = responseJson.presigned_url;
		// Get the data from the presigned URL
		const presignedRes = await fetch(presignedUrl);
		// value structure: fda7681c-d7f1-4420-8499-46b4695d224a/temp/1729261457039.c979d19c-0546-412b-a2d9-63a247d7c250/
		// observer: fda7681c-d7f1-4420-8499-46b4695d224a
		// timestamp: 1729261457039
		// ad_id: c979d19c-0546-412b-a2d9-63a247d7c250
		const raw = await presignedRes.json();

		const parseAdPath = (path: string) => {
			const parts = path.split('/');
			const observer = parts[0];
			const timestampAndId = parts[2];
			const [adId, timestamp] = timestampAndId.split('.').reverse();
			return { observer, timestamp, adId, path };
		};

		data = {
			ads: raw['ads'].map((path: string) => parseAdPath(path)),
			ads_passed_ocr: raw['ads_passed_ocr'].map((path: string) => parseAdPath(path)),
			ads_passed_ad_scrape: raw['ads_passed_ad_scrape'].map((path: string) => parseAdPath(path)),
			ads_passed_mass_download: raw['ads_passed_mass_download'].map((path: string) =>
				parseAdPath(path)
			)
		};
		console.log('data', data);
		loading = false;
	};

	$effect(() => {
		if (!auth.loading && !auth.currentUser) {
			location.href = loginPath;
		}
	});

	$effect(() => {
		fetchAdsIndex();
	});
</script>

<div class="flex flex-col gap-8 p-4">
	<h1>Mobile Observations</h1>

	{#if loading}
		<div class="flex size-full items-center justify-center">
			<Circle size="200" color="black" />
		</div>
	{/if}

	{#if data}
		<ParticipantsTable adsIndex={data} />
	{/if}
</div>
