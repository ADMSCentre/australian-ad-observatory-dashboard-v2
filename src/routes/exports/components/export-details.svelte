<script lang="ts">
	import type { Export } from '../types';
	import Accordion from '$lib/components/accordion/accordion.svelte';
	import AdsBrowser from '../../mobile-observations/components/ads-browser.svelte';
	import { parseRawAdPaths } from '$lib/api/session/ads/ads-index';
	import { session } from '$lib/api/session/session.svelte';
	import { exportsManager } from '../exports.svelte';
	import { Check, X, ChevronRight, LoaderCircle } from 'lucide-svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { twMerge } from 'tailwind-merge';

	let { exportItem }: { exportItem: Export } = $props();

	let previewLoading = $state(false);
	let previewAds = $state<any[]>([]);
	let previewError = $state<string | null>(null);
	let browseAdsOpen = $state(false);

	const query = $derived(exportItem.export_parameters.query);
	const fields = $derived(exportItem.export_parameters.fields);
	const includeImages = $derived(exportItem.export_parameters.include_images);

	// Get field names from paths
	const getFieldName = (path: string): string => {
		const field = exportsManager.fields.find((f) => f.path === path);
		return field?.name || path;
	};

	const formatQuery = (q: typeof query): string => {
		if (!q) return 'No query';
		if (typeof q === 'string') return q;

		const method = q.method;
		const args = q.args || [];

		if (args.length === 0) return method;

		const formattedArgs = args.map((arg) => {
			if (typeof arg === 'string') return `"${arg}"`;
			return formatQuery(arg as typeof query);
		});

		return `${method}(${formattedArgs.join(', ')})`;
	};

	const previewQuery = async () => {
		if (!query || !query.method) {
			previewError = 'No query defined';
			return;
		}

		previewLoading = true;
		previewError = null;

		try {
			const queryState = session.query.prepare(query, true);
			await queryState.fetch();
			if (queryState.paths) {
				previewAds = parseRawAdPaths(queryState.paths);
			} else {
				previewAds = [];
			}
		} catch (e) {
			previewError = 'Failed to preview ads';
			console.error(e);
		} finally {
			previewLoading = false;
		}
	};
</script>

<div class="flex flex-col gap-4">
	<!-- Query Display -->
	<div class="flex flex-col gap-2">
		<h4 class="text-sm font-semibold">Query</h4>
		<div class="rounded-lg bg-muted p-3">
			<code class="text-sm">
				{formatQuery(query)}
			</code>
		</div>
	</div>

	<!-- Include Images -->
	<div class="flex items-center gap-2">
		<h4 class="text-sm font-semibold">Include Images:</h4>
		{#if includeImages}
			<Badge variant="default" class="gap-1 bg-green-600">
				<Check class="size-3" />
				Yes
			</Badge>
		{:else}
			<Badge variant="secondary" class="gap-1">
				<X class="size-3" />
				No
			</Badge>
		{/if}
	</div>

	<!-- Fields -->
	<div class="flex flex-col gap-2">
		<h4 class="text-sm font-semibold">
			Fields ({fields.length > 0 ? fields.length : 'Default'})
		</h4>
		{#if fields.length === 0}
			<p class="text-sm text-muted-foreground">Using default fields</p>
		{:else}
			<div class="flex flex-wrap gap-1">
				{#each fields as field (field)}
					<Badge variant="outline" class="text-xs">
						{getFieldName(field)}
					</Badge>
				{/each}
			</div>
		{/if}
	</div>
</div>
