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
		ChevronRight,
		User,
		Edit,
		Users,
		SettingsIcon,
		Folder,
		Download,
		ScanEyeIcon,
		Library
	} from 'lucide-svelte';
	import { auth } from '$lib/api/auth/auth.svelte';
	import { Button } from '../ui/button';
	import AppLogos from '../app-logos.svelte';
	import MaintenanceAlert from '../maintenance-alert.svelte';

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
				},
				{
					title: 'Review Hidden Ads',
					url: withBase('mobile-observations/hidden-ads'),
					icon: ScanEyeIcon,
					visible: auth.currentUser?.role === 'admin'
				},
				{
					title: 'Settings',
					url: withBase('mobile-observations/settings'),
					icon: SettingsIcon,
					visible: true
				}
			]
		},
		{
			title: 'Commercial Content Library',
			icon: Library,
			visible: auth.currentUser?.role === 'user' || auth.currentUser?.role === 'admin',
			subItems: [
				{
					title: 'Advertisers',
					url: withBase('ccl/advertisers'),
					visible: false
				},
				{
					title: 'Snapshots',
					url: withBase('ccl/snapshots'),
					visible: true
				}
			]
		},
		{
			title: 'Data Download Packages',
			url: withBase('data-download-packages'),
			icon: Folder,
			visible: true
		},
		{
			title: 'Exports',
			url: withBase('exports'),
			icon: Download,
			visible: auth.currentUser?.role === 'user' || auth.currentUser?.role === 'admin'
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

<Sidebar.Root class="border-r border-sidebar-border/40">
	<Sidebar.Header class="flex flex-col items-center gap-3 border-b border-white/10 px-4 py-5">
		<div class="inline-flex flex-wrap items-center justify-center gap-2">
			<AppLogos logoClass="h-12 w-auto" />
		</div>
		<a href={withBase('/')} class="flex flex-col items-center text-center no-underline">
			<h1 class="text-sm font-semibold leading-5 tracking-normal text-white">
				Australian Ad Observatory
			</h1>
		</a>
	</Sidebar.Header>
	<Sidebar.Content class="px-2 py-4">
		<Sidebar.Group>
			<Sidebar.GroupContent>
				{#each items as item (item.title)}
					{#if item.subItems}
						<Sidebar.Menu class="gap-1">
							<Collapsible.Root open class="group/collapsible">
								<Sidebar.MenuItem>
									<Collapsible.Trigger>
										{#snippet child({ props })}
											<Sidebar.MenuButton
												{...props}
												isActive={item.proxyActive}
												class="font-medium"
											>
												<item.icon />
												<span>{item.title}</span>
												<ChevronRight
													class="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
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
															class="absolute left-0 top-1/2 flex h-1/2 w-fit -translate-x-3 -translate-y-1/2 items-center justify-center text-amber-300"
														>
															<Circle size={10} fill="currentColor" />
														</div>
													{/if}
													<Sidebar.MenuSubButton isActive={sub.active}>
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
								<Sidebar.MenuButton isActive={item.active} class="font-medium">
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
	<Sidebar.Footer class="gap-3 border-t border-white/10 p-3">
		<MaintenanceAlert />
		{#if auth.currentUser}
			<div
				class="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 p-2 text-sm"
			>
				<div class="flex min-w-0 items-center gap-2">
					<User class="size-4 shrink-0 text-sidebar-foreground/70" />
					<span class="truncate font-medium">{auth.currentUser.full_name}</span>
				</div>
				<Button
					variant="ghost"
					size="icon"
					class="size-8 shrink-0 text-sidebar-foreground hover:bg-white/10 hover:text-white"
					href={withBase('users/self')}
					aria-label="Edit profile"
				>
					<Edit class="size-4" />
				</Button>
			</div>
		{/if}
	</Sidebar.Footer>
</Sidebar.Root>
