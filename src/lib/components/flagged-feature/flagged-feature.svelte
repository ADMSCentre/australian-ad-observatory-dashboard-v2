<script lang="ts">
	import type { FeatureId } from '$lib/api/session/features.svelte';
	import type { Snippet } from 'svelte';
	import { setFlaggedFeatureContext, getFlaggedFeatureContext } from './context.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';

	const {
		children,
		alternative,
		feature
	}: { children?: Snippet; alternative?: Snippet; feature: FeatureId } = $props();

	setFlaggedFeatureContext(feature);
	const context = getFlaggedFeatureContext();
</script>

{#if context.isEnabled}
	{@render children?.()}
{:else if alternative}
	<Tooltip.Root>
		<Tooltip.Trigger class=" size-auto">
			{@render alternative?.()}
		</Tooltip.Trigger>
		<Tooltip.Content>
			<p class="max-w-sm text-wrap text-left text-xs font-normal text-muted-foreground">
				The feature <strong>{context.feature?.name}</strong> is currently disabled. Please contact the
				Australian Ad Observatory team for more information.
			</p>
		</Tooltip.Content>
	</Tooltip.Root>
{:else}
	<div class="text-center text-gray-500">
		Feature <strong>{context.feature?.name}</strong> is disabled
	</div>
{/if}
