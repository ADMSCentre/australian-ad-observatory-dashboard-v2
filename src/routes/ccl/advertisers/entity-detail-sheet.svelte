<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import type { CclEntity } from '$lib/types/ccl';

	interface Props {
		entity: CclEntity;
		onClose: () => void;
	}

	const { entity, onClose }: Props = $props();
	const data = $derived(entity.data);
</script>

<Sheet.Root
	open={true}
	onOpenChange={(open) => {
		if (!open) onClose();
	}}
>
	<Sheet.Content class="min-w-[100vw] overflow-y-scroll sm:min-w-[40vw] sm:max-w-2xl">
		<Sheet.Header>
			<Sheet.Title>{entity.name}</Sheet.Title>
			<Sheet.Description>
				{data.category || 'Unknown category'} &middot; {entity.type}
			</Sheet.Description>
		</Sheet.Header>

		<Tabs.Root value="overview">
			<Tabs.List>
				<Tabs.Trigger value="overview">Overview</Tabs.Trigger>
				<Tabs.Trigger value="details">Details</Tabs.Trigger>
				<Tabs.Trigger value="raw">JSON</Tabs.Trigger>
			</Tabs.List>

			<!-- Overview Tab -->
			<Tabs.Content value="overview">
				<div class="space-y-4 py-4">
					{#if data.image_uri}
						<img
							src={data.image_uri}
							alt={data.name}
							class="h-48 w-full rounded-md object-cover"
							onerror={(e) => {
								(e.target as HTMLImageElement).style.display = 'none';
							}}
						/>
					{/if}

					<div class="space-y-3">
						<div>
							<p class="text-xs font-semibold uppercase text-muted-foreground">Name</p>
							<p class="font-medium">{data.name}</p>
						</div>

						<div>
							<p class="text-xs font-semibold uppercase text-muted-foreground">Category</p>
							<p class="font-medium">{data.category || 'N/A'}</p>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div>
								<p class="text-xs font-semibold uppercase text-muted-foreground">Likes</p>
								<p class="font-medium">{data.likes?.toLocaleString() ?? 0}</p>
							</div>
							<div>
								<p class="text-xs font-semibold uppercase text-muted-foreground">Country</p>
								<p class="font-medium">{data.country || 'Unknown'}</p>
							</div>
						</div>

						{#if data.ig_username || data.ig_followers}
							<div class="grid grid-cols-2 gap-4">
								{#if data.ig_username}
									<div>
										<p class="text-xs font-semibold uppercase text-muted-foreground">IG Username</p>
										<p class="font-medium">@{data.ig_username}</p>
									</div>
								{/if}
								{#if data.ig_followers}
									<div>
										<p class="text-xs font-semibold uppercase text-muted-foreground">
											IG Followers
										</p>
										<p class="font-medium">{data.ig_followers.toLocaleString()}</p>
									</div>
								{/if}
							</div>
						{/if}

						<div class="flex flex-wrap items-center gap-2">
							<Badge
								variant="outline"
								class={data.verification === 'BLUE_VERIFIED'
									? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300'
									: ''}
							>
								{data.verification === 'BLUE_VERIFIED' ? 'Verified' : 'Not Verified'}
							</Badge>
							{#if data.ig_verification}
								<Badge
									variant="outline"
									class="border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-950 dark:text-purple-300"
								>
									IG Verified
								</Badge>
							{/if}
							{#if data.page_is_deleted}
								<Badge variant="destructive">Page Deleted</Badge>
							{/if}
						</div>

						<div class="space-y-1 text-sm text-muted-foreground">
							<p><span class="font-medium">Page ID:</span> {data.page_id}</p>
							{#if data.page_alias}
								<p><span class="font-medium">Alias:</span> {data.page_alias}</p>
							{/if}
							<p><span class="font-medium">Entity Type:</span> {data.entity_type}</p>
							<p><span class="font-medium">Source ID:</span> {entity.source_id}</p>
						</div>
					</div>
				</div>
			</Tabs.Content>

			<!-- Details Tab - All fields in table format -->
			<Tabs.Content value="details">
				<div class="max-h-[70vh] space-y-3 overflow-y-auto py-4">
					{#each Object.entries(data) as [key, value]}
						{#if value !== null && value !== undefined && typeof value !== 'object'}
							<div class="border-b pb-2">
								<p class="text-xs font-semibold uppercase text-muted-foreground">
									{key.replace(/_/g, ' ')}
								</p>
								<p class="text-sm">{String(value)}</p>
							</div>
						{/if}
					{/each}
					<!-- Object fields shown as JSON snippets -->
					{#each Object.entries(data) as [key, value]}
						{#if value !== null && value !== undefined && typeof value === 'object'}
							<div class="border-b pb-2">
								<p class="text-xs font-semibold uppercase text-muted-foreground">
									{key.replace(/_/g, ' ')}
								</p>
								<pre class="mt-1 overflow-x-auto rounded bg-muted p-2 text-xs">{JSON.stringify(
										value,
										null,
										2
									)}</pre>
							</div>
						{/if}
					{/each}
				</div>
			</Tabs.Content>

			<!-- Raw JSON Tab -->
			<Tabs.Content value="raw">
				<pre
					class="mt-4 max-h-[70vh] overflow-auto rounded-md bg-muted p-4 text-xs">{JSON.stringify(
						entity,
						null,
						2
					)}</pre>
			</Tabs.Content>
		</Tabs.Root>
	</Sheet.Content>
</Sheet.Root>
