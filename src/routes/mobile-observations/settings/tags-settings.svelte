<script lang="ts">
	import { session } from '$lib/api/session/session.svelte';
	import { untrack } from 'svelte';
	import CreateTagForm from './components/create-tag-form.svelte';
	import TagLineItem from './components/tag-line-item.svelte';
	import { auth } from '$lib/api/auth/auth.svelte';
	import PageLoader from '$lib/components/page-loader/page-loader.svelte';

	$effect(() => {
		auth.currentUser;
		untrack(() => {
			session.tags.fetch();
		});
	});
</script>

<h2 class="text-lg font-medium">Tags</h2>
<p class="text-sm text-muted-foreground">
	Tags can be used to label and categorise the observations.
</p>

{#if session.tags.loading}
	<PageLoader />
{/if}

{#if !session.tags.loading}
	<div class="flex flex-col gap-2">
		{#each session.tags.all as tag (tag.id)}
			<TagLineItem {tag} />
		{/each}
	</div>
{/if}

{#if !session.tags.loading && session.tags.all.length === 0}
	<p class="text-sm text-muted-foreground">No tags created yet. Create a tag to get started.</p>
{/if}

{#if session.tags.error}
	<p class="text-sm text-red-500">Error loading tags: {session.tags.error}</p>
{/if}

<CreateTagForm />
