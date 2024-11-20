<script lang="ts">
	import { page } from '$app/stores';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import { homePath, mobileObservationsPath, webObservationsPath } from '$lib/routes.config';
	import {
		Smartphone,
		Search,
		HeartPulse,
		Globe,
		Circle,
		ChevronDown,
		ChevronRight
	} from 'lucide-svelte';
	import { twMerge } from 'tailwind-merge';

	// Get the current url

	const itemsDef = [
		{
			title: 'Mobile Ads Observatory',
			// url: mobileObservationsPath,
			icon: Smartphone,
			subItems: [
				{
					title: 'Monitor',
					icon: HeartPulse,
					url: mobileObservationsPath
				},
				{
					title: 'Query',
					icon: Search,
					url: `${mobileObservationsPath}/query`
				}
			]
		},
		{
			title: 'Web Observations',
			url: webObservationsPath,
			icon: Globe
		}
	];

	const items = $derived.by(() => {
		const currentUrl = $page.url.pathname;
		return itemsDef.map((item) => {
			// Proxy-active if the any of the sub-items match the current url
			if (item.subItems) {
				const subItems = item.subItems.map((sub) => {
					return {
						...sub,
						active: sub.url === currentUrl
					};
				});
				return {
					...item,
					proxyActive: subItems.some((sub) => sub.active),
					subItems
				};
			}
			return {
				...item,
				active: item.url === currentUrl
			};
		});
	});
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
				{#each items as item (item.title)}
					{#if item.subItems}
						<Sidebar.Menu class="gap-0">
							<Collapsible.Root open class="group/collapsible">
								<Sidebar.MenuItem>
									<Collapsible.Trigger>
										{#snippet child({ props })}
											<Sidebar.MenuButton {...props} class={item.proxyActive ? 'underline' : ''}>
												<item.icon />
												<span>{item.title}</span>
												<ChevronRight
													class="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90"
												/>
											</Sidebar.MenuButton>
										{/snippet}
									</Collapsible.Trigger>
									<Collapsible.Content>
										<Sidebar.MenuSub>
											{#each item.subItems as sub (sub.title)}
												<Sidebar.MenuSubItem>
													{#if sub.active}
														<div
															class="absolute left-0 flex h-1/2 w-fit -translate-x-1/2 items-center justify-center"
														>
															<Circle size={10} fill="currentColor" />
														</div>
													{/if}
													<Sidebar.MenuSubButton>
														{#snippet child({ props })}
															<a href={sub.url} {...props}>
																<span>{sub.title}</span>
															</a>
														{/snippet}
													</Sidebar.MenuSubButton>
												</Sidebar.MenuSubItem>
											{/each}
										</Sidebar.MenuSub>
									</Collapsible.Content>
								</Sidebar.MenuItem>
							</Collapsible.Root>
						</Sidebar.Menu>
					{:else}
						<Sidebar.Menu>
							<Sidebar.MenuItem>
								<Sidebar.MenuButton class={item.active ? 'underline' : ''}>
									{#snippet child({ props })}
										<a href={item.url} {...props}>
											<item.icon />
											<span>{item.title}</span>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						</Sidebar.Menu>
					{/if}
				{/each}
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Footer />
</Sidebar.Root>

<style>
	[data-sidebar='menu-item']::before {
		content: 'Test';
	}
</style>
