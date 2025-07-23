<script>
	import ProfileEditor from './profile-editor.svelte';

	import { auth } from '$lib/api/auth/auth.svelte';
</script>

{#if auth.currentUser?.provider === 'local'}
	<ProfileEditor />
{:else}
	<p class="text-center text-lg">
		You are logged in with an external account. You cannot edit your profile here.
	</p>
{/if}
