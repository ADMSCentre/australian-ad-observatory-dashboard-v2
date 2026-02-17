<script lang="ts">
	let { children } = $props();
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-col gap-1">
		<h1 class="text-2xl font-bold">Commercial Content Library</h1>
		<p class="text-sm text-muted-foreground">
			Browse advertisers and advertisement snapshots scraped as part of CCL enrichment.
		</p>
	</div>
	{@render children()}
</div>
