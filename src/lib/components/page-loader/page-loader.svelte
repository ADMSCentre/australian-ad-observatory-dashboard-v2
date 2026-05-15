<script>
	import { theme } from '$lib/states/theme.svelte';
	import { Circle } from 'svelte-loading-spinners';
</script>

<div class="flex size-full min-h-64 items-center justify-center p-8">
	<Circle size="96" color={theme.colors.foreground} />
</div>
