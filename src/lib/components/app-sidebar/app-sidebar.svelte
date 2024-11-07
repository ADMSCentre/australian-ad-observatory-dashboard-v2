<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
</script>

<Sidebar.Root>
	<Sidebar.Header>
		<a href="/" class="flex flex-col items-center">
			<img
				src="https://australian-ad-observatory.s3.us-east-2.amazonaws.com/static/img/brand_logo_1.png"
				alt="Australian Ad Observatory"
				class="size-24"
			/>
			<h1 class="text-lg font-semibold text-white">Australian Ad Observatory</h1>
		</a>
	</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group />
		<Sidebar.Group />
	</Sidebar.Content>
	<Sidebar.Footer />
</Sidebar.Root>
