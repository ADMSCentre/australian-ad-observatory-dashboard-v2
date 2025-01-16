<script lang="ts">
	import { auth } from '$lib/api/auth/auth.svelte';
	import { jwtDecode } from 'jwt-decode';
	import Timer from './timer.svelte';

	const { class: className = '', onExpire = () => {} }: { class?: string; onExpire?: () => void } =
		$props();

	const guestTokenDecoded = $derived.by(() => {
		if (!auth.token || !auth.isGuest) return null;
		return jwtDecode(auth.token) as {
			exp: number;
			description: string;
		};
	});
</script>

{#if guestTokenDecoded}
	Your session will end in
	<Timer exp={guestTokenDecoded.exp * 1000} {onExpire} class={className} />
{/if}
