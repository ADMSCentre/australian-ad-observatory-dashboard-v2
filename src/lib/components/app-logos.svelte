<script lang="ts">
	const { logoClass = 'size-24' } = $props();
	import AIOLogo from '$lib/components/images/aio-logo.svg';
	import ADMSLogo from '$lib/components/images/adms-logo.png';
	import { twMerge } from 'tailwind-merge';
	import { theme } from '$lib/states/theme.svelte';
</script>

<a
	href="https://www.admscentre.org.au/"
	target="_blank"
	rel="noopener noreferrer"
	class="inline-flex rounded-md ring-1 ring-transparent transition-all duration-200 hover:ring-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
>
	<img
		src={ADMSLogo}
		alt="ADM+S Logo"
		class={twMerge(logoClass, theme.mode === 'dark' && 'invert')}
	/>
</a>
<a
	href="https://internetobservatory.org.au/"
	target="_blank"
	rel="noopener noreferrer"
	class="inline-flex rounded-md ring-1 ring-transparent transition-all duration-200 hover:ring-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
>
	<img
		src={AIOLogo}
		alt="AIO Logo"
		class={twMerge(logoClass, 'p-2', theme.mode === 'dark' && 'invert')}
	/>
</a>
