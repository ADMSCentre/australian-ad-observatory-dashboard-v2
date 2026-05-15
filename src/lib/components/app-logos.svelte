<script lang="ts">
	const { logoClass = 'size-24' } = $props();
	import AIOLogoDark from '$lib/components/images/aio-logo-dark.png';
</script>

<a
	href="https://www.admscentre.org.au/"
	target="_blank"
	rel="noopener noreferrer"
	class="inline-flex rounded-md ring-1 ring-transparent transition-all duration-200 hover:ring-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
>
	<img
		src="https://australian-ad-observatory.s3.us-east-2.amazonaws.com/static/img/brand_logo_1.png"
		alt="ADM+S Logo"
		class={logoClass}
	/>
</a>
<a
	href="https://internetobservatory.org.au/"
	target="_blank"
	rel="noopener noreferrer"
	class="inline-flex rounded-md ring-1 ring-transparent transition-all duration-200 hover:ring-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
>
	<img src={AIOLogoDark} alt="AIO Logo" class={logoClass} />
</a>
