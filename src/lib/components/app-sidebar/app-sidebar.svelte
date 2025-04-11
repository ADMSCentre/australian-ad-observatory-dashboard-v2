<script lang="ts">
	import { page } from '$app/stores';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import { withBase } from '$lib/utils';
	import {
		Smartphone,
		Search,
		HeartPulse,
		Globe,
		Circle,
		ChevronDown,
		ChevronRight,
		User,
		Edit,
		Users,
		Folder // Import Folder icon
	} from 'lucide-svelte';
	import { twMerge } from 'tailwind-merge';
	import { auth } from '$lib/api/auth/auth.svelte';
	import { Button } from '../ui/button';

	// Get the current url

	const itemsDef = $derived([
		{
			title: 'Mobile Ads Observatory',
			// url: mobileObservationsPath,
			icon: Smartphone,
			visible: true,
			subItems: [
				{
					title: 'Monitor',
					icon: HeartPulse,
					url: withBase(`mobile-observations`),
					visible: true
				},
				{
					title: 'Query',
					icon: Search,
					url: withBase(`mobile-observations/query`),
					visible: true
				},
				{
					title: 'Projects', // Added Projects section
					url: withBase('mobile-observations/projects'),
					icon: Folder,
					visible: true
				}
			]
		},
		{
			title: 'Web Observations',
			url: withBase('web-observations'),
			icon: Globe,
			visible: false
		},
		{
			title: 'Users',
			url: withBase('users'),
			icon: Users,
			visible: auth.currentUser?.role === 'admin'
		}
	]);

	const items = $derived.by(() => {
		const currentUrl = $page.url.pathname;
		return itemsDef
			.filter((item) => item.visible)
			.map((item) => {
				// Proxy-active if the any of the sub-items match the current url
				if (item.subItems) {
					const subItems = item.subItems
						.filter((sub) => sub.visible)
						.map((sub) => {
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
		<a href={withBase('/')} class="flex flex-col items-center">
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
												<Sidebar.MenuSubItem class="relative">
													{#if sub.active}
														<div
															class="absolute left-0 top-1/2 flex h-1/2 w-fit -translate-x-4 -translate-y-1/2 items-center justify-center"
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
	<Sidebar.Footer>
		{#if auth.currentUser}
			<div class="flex items-center justify-between gap-2">
				<div class="flex items-center gap-1">
					<User />
					<span>{auth.currentUser.full_name}</span>
				</div>
				<Button variant="ghost" class="flex items-center gap-1" href={withBase('users/self')}>
					<Edit />
				</Button>
			</div>
		{/if}
	</Sidebar.Footer>
</Sidebar.Root>

<style>
	[data-sidebar='menu-item']::before {
		content: 'Test';
	}
</style>
