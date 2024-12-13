<script lang="ts">
	import { onMount } from 'svelte';
	import type { PlatformItemData } from './platform-item';
	import { getAuthState } from '$lib/api/auth.svelte';
	import { useDashboardAPI } from '$lib/api/use-dashboard';
	import { Circle } from 'svelte-loading-spinners';
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import { theme } from '$lib/states/theme.svelte';

	const auth = getAuthState();

	const {
		itemId,
		presignedUrl
	}: {
		itemId: string;
		presignedUrl: string;
	} = $props();

	let data = $state<PlatformItemData | null>(null);

	const getImage = async () => {
		const mediaImages = data?.media.image_urls ? Object.entries(data.media.image_urls) : [];
		const res: {
			success: boolean;
			presigned_urls: {
				[key: string]: string;
			};
		} = await useDashboardAPI({
			actionType: 'presign',
			data: {
				session_token: auth.token,
				media: mediaImages.map(([mediaId, imageUrl]) => imageUrl).flat(),
				json: []
			}
		});
		console.log('urls', res.presigned_urls);
		return Object.entries(res.presigned_urls).map(([_, url]) => url);
	};

	const getAdvertiser = () => {
		const keys = Object.keys(data?.advertiser.advertiser_id || {});
		if (keys.length === 0) return null;
		const key = keys[0];
		return {
			name: data?.advertiser.page_name[key],
			pageUrl:
				typeof data?.advertiser.page_url[key] === 'string' ? data?.advertiser.page_url[key] : null
		};
	};

	const imageUrls = $derived(getImage());
	const advertiser = $derived(getAdvertiser());

	onMount(async () => {
		console.log('itemId', itemId);
		console.log('presignedUrl', presignedUrl);

		const res = await fetch(presignedUrl);
		data = await res.json();
	});
</script>

{#if data}
	<div class="flex h-80 w-56 flex-col justify-between gap-4 p-4 shadow">
		{#if advertiser}
			<div>
				<a
					href={advertiser?.pageUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="font-semibold text-blue-500 underline">{advertiser?.name}</a
				>
			</div>
		{/if}
		<div class=" flex flex-1 items-center justify-center bg-foreground">
			{#await imageUrls}
				<Circle size="100" color={theme.colors.background} />
			{:then urls}
				<Carousel.Root>
					<Carousel.Content>
						{#each urls as url}
							<Carousel.Item>
								<img src={url} alt="" />
							</Carousel.Item>
						{/each}
					</Carousel.Content>
				</Carousel.Root>
			{:catch error}
				<p style="color: red">{error.message}</p>
			{/await}
		</div>
	</div>
{/if}
