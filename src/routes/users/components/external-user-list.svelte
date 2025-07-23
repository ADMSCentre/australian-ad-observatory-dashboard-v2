<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { fade, scale } from 'svelte/transition';
	import ExternalUserCard from './external-user-card.svelte';
	import { setExternalUserContext, getExternalUserContext } from './external-users-context.svelte';
	import { flip } from 'svelte/animate';

	setExternalUserContext();
	const context = getExternalUserContext();

	let showAllUsers = $state(false);

	const visibleUsers = $derived(
		showAllUsers ? context.items : context.items.filter((u) => !u.enabled)
	);
</script>

<section>
	<p class="text-sm text-muted-foreground">
		There {context.items.length <= 1 ? 'is' : 'are'}
		{context.items.length} external {'user' + (context.items.length <= 1 ? '' : 's')} with {context.items.filter(
			(u) => !u.enabled
		).length} pending approval. Click <Button
			variant="link"
			class="p-0 text-brand"
			onclick={() => (showAllUsers = !showAllUsers)}
		>
			here
		</Button> to {showAllUsers ? 'show only pending users' : 'show all users'}.
	</p>
	<p class="text-sm text-muted-foreground">
		<strong> Please ensure that you trust the user before approving them. </strong>
		By approving external users, you allow them to access the dashboard and its features, including the
		data collected by the Australian Ad Observatory project.
	</p>
</section>

<div class="flex flex-row flex-wrap gap-4">
	{#each visibleUsers as user (user.id)}
		<div class="w-96" animate:flip transition:scale>
			<ExternalUserCard {user} />
		</div>
	{/each}
</div>
