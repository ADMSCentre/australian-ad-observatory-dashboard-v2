<script>
	import { theme } from '$lib/states/theme.svelte';
	import { Circle } from 'svelte-loading-spinners';
</script>

<div class="flex size-full items-center justify-center">
	<Circle size="200" color={theme.colors.foreground} />
</div>
