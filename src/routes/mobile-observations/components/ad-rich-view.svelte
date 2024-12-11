<script lang="ts">
	import { getAuthState } from '$lib/api/auth.svelte';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import Codemirror from 'svelte-codemirror-editor';
	import { json } from '@codemirror/lang-json';

	import type { RichAdData } from '../types';
	import { fetchRichDataObject } from '../utils';
	import AdCardBody from './ad-card-body.svelte';

	let {
		richViewExpanded = $bindable(false),
		currentAd = $bindable()
	}: {
		richViewExpanded: boolean;
		currentAd: RichAdData | null;
	} = $props();

	const auth = getAuthState();

	$effect(() => {
		(async () => {
			if (!currentAd || !auth.token) return;
			currentAd.richDataObject = await fetchRichDataObject(currentAd, auth.token);
		})();
	});
</script>

{#if currentAd}
	{#snippet stitchedAd()}
		<div>
			<p class="text-xs">Ad-only view - only the ad content is shown.</p>
			<AdCardBody adData={currentAd} class="max-w-96" framesMode={'stitched'} />
		</div>
	{/snippet}

	{#snippet originalAd()}
		<div>
			<p class="text-xs">Original view - the original recording is shown.</p>
			<AdCardBody adData={currentAd} class="max-w-96" framesMode="raw" />
		</div>
	{/snippet}

	{#snippet richDataJson()}
		{#if currentAd.richDataObject}
			<strong>
				NOTE: The rich data object shown here is mocked and does not represent the actual data.
			</strong>
			<Codemirror
				class=" max-h-[75vh] overflow-auto text-left"
				lang={json()}
				lineWrapping
				value={JSON.stringify(currentAd, null, 2)}
				readonly
			/>
		{:else}
			<p>Loading...</p>
		{/if}
	{/snippet}

	<Sheet.Root
		open={richViewExpanded}
		onOpenChange={(open) => {
			richViewExpanded = open;
		}}
	>
		<Sheet.Content class="min-w-[100vw] overflow-y-scroll sm:min-w-[60vw]">
			<Sheet.Header>
				<Sheet.Title>Rich Ad Data View</Sheet.Title>
				<Sheet.Description>
					This view shows the Rich Data Object for the current ad.
				</Sheet.Description>
			</Sheet.Header>
			<Tabs.Root value="captured-ad">
				<Tabs.List>
					<Tabs.Trigger value="captured-ad">Captured Ad</Tabs.Trigger>
					<Tabs.Trigger value="rich-data">Rich Data Object</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="captured-ad">
					<div class="flex flex-col gap-2 md:flex-row">
						{@render originalAd()}
						{@render stitchedAd()}
					</div>
				</Tabs.Content>
				<Tabs.Content value="rich-data">
					{@render richDataJson()}
				</Tabs.Content>
			</Tabs.Root>
		</Sheet.Content>
	</Sheet.Root>
{/if}
