<script lang="ts">
	import { getAuthState } from '$lib/api/auth.svelte';

	const auth = getAuthState();
</script>

<div class="p-8">
	<h1 class="text-2xl font-semibold">Welcome to the Australian Ad Observatory</h1>
</div>
