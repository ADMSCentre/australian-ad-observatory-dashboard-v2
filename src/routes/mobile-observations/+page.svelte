<script lang="ts">
	import MobileObservationsDashboard from './mobile-observations-dashboard.svelte';
</script>

<svelte:head>
	<title>Mobile Observations</title>
	<meta name="description" content="Mobile Observations" />
</svelte:head>

<div class="flex flex-col gap-8 p-1 pb-0 sm:p-4">
	<h1>Mobile Observations</h1>

	<div>
		The following data is collected using the <a
			href="https://play.google.com/store/apps/details?id=com.adms.australianmobileadtoolkit"
			target="_blank"
			class="underline hover:text-blue-500"
			rel="noopener noreferrer">Australian Mobile Ad Toolkit</a
		>
		app.
	</div>

	<MobileObservationsDashboard />
</div>
