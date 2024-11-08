<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { homePath, mobileObservationsPath, webObservationsPath } from '$lib/routes.config';
	import { Smartphone, Search } from 'lucide-svelte';

	const items = [
		{
			title: 'Mobile Observations',
			url: mobileObservationsPath,
			icon: Smartphone
		},
		{
			title: 'Web Observations',
			url: webObservationsPath,
			icon: Search
		}
	];
</script>

<Sidebar.Root>
	<Sidebar.Header>
		<a href={homePath} class="flex flex-col items-center">
			<img
				src="https://australian-ad-observatory.s3.us-east-2.amazonaws.com/static/img/brand_logo_1.png"
				alt="Australian Ad Observatory"
				class="size-24"
			/>
			<h1 class="text-lg font-semibold text-white">Australian Ad Observatory</h1>
		</a>
	</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each items as item (item.title)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet child({ props })}
									<a href={item.url} {...props}>
										<item.icon />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Footer />
</Sidebar.Root>
