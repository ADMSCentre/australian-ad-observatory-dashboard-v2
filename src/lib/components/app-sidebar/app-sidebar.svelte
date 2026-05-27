<script lang="ts">
	import { page } from '$app/stores';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import { withBase } from '$lib/utils';
	import {
		Smartphone,
		Search,
		Globe,
		ChevronDown,
		ChevronRight,
		User,
		Edit,
		Users,
		Settings,
		Library,
		Monitor,
		FolderKanban,
		FileUp,
		EyeOff,
		Camera,
		Tags,
		Package,
		House
	} from 'lucide-svelte';
	import { auth } from '$lib/api/auth/auth.svelte';
	import { Button } from '../ui/button';
	import AppLogos from '../app-logos.svelte';
	import MaintenanceAlert from '../maintenance-alert.svelte';

	type IconComponent = typeof Smartphone;
	type NavSubItem = {
		title: string;
		url: string;
		icon: IconComponent;
		visible: boolean;
		active?: boolean;
	};
	type NavItem = {
		title: string;
		icon: IconComponent;
		visible: boolean;
		url?: string;
		subItems?: NavSubItem[];
		active?: boolean;
		proxyActive?: boolean;
	};

	// Get the current url
	let manuallyExpandedSection = $state<string | null | undefined>(undefined);

	const itemsDef: NavItem[] = $derived([
		{
			title: 'Home',
			url: withBase('/'),
			icon: House,
			visible: true
		},
		{
			title: 'Mobile Ads',
			// url: mobileObservationsPath,
			icon: Smartphone,
			visible: true,
			subItems: [
				{
					title: 'Monitor',
					icon: Monitor,
					url: withBase(`mobile-observations`),
					visible: true
				},
				{
					title: 'Projects', // Added Projects section
					url: withBase('mobile-observations/projects'),
					icon: FolderKanban,
					visible: true
				},
				{
					title: 'Exports',
					url: withBase('exports'),
					icon: FileUp,
					visible: auth.currentUser?.role === 'user' || auth.currentUser?.role === 'admin'
				},
				{
					title: 'Query',
					icon: Search,
					url: withBase(`mobile-observations/query`),
					visible: true
				},
				{
					title: 'Review Hidden Ads',
					url: withBase('mobile-observations/hidden-ads'),
					icon: EyeOff,
					visible: auth.currentUser?.role === 'admin'
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
					icon: Users,
					visible: false
				},
				{
					title: 'Snapshots',
					url: withBase('ccl/snapshots'),
					icon: Camera,
					visible: true
				}
			]
		},
		{
			title: 'Settings',
			icon: Settings,
			visible: true,
			subItems: [
				{
					title: 'Tags',
					url: withBase('mobile-observations/settings'),
					icon: Tags,
					visible: true
				},
				{
					title: 'Users',
					url: withBase('users'),
					icon: Users,
					visible: auth.currentUser?.role === 'admin'
				}
			]
		},
		{
			title: 'Data Download Packages',
			url: withBase('data-download-packages'),
			icon: Package,
			visible: true
		},
		{
			title: 'Web Observations',
			url: withBase('web-observations'),
			icon: Globe,
			visible: false
		}
	]);

	const items: NavItem[] = $derived.by(() => {
		const currentUrl = $page.url.pathname;
		const isActiveUrl = (url?: string) => {
			if (!url) return false;
			if (currentUrl === url) return true;
			return url !== withBase('mobile-observations') && currentUrl.startsWith(`${url}/`);
		};

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
								active: isActiveUrl(sub.url)
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
					active: isActiveUrl(item.url)
				};
			});
	});

	const activeSectionTitle = $derived(
		items.find((item) => item.subItems && item.proxyActive)?.title
	);
	const expandedSection = $derived(
		manuallyExpandedSection ??
			activeSectionTitle ??
			items.find((item) => item.subItems)?.title ??
			null
	);

	function toggleSection(title: string) {
		manuallyExpandedSection = expandedSection === title ? null : title;
	}
</script>

<Sidebar.Root class="border-r border-sidebar-border/40">
	<Sidebar.Header class="flex flex-col items-center gap-3 px-3 py-4">
		<div class="inline-flex flex-wrap items-center justify-center gap-2">
			<AppLogos logoClass="h-16 w-auto" />
		</div>
		<a href={withBase('/')} class="flex flex-col items-center text-center no-underline">
			<h1 class="text-lg font-semibold leading-5 tracking-normal text-sidebar-foreground">
				Australian Ad Observatory
			</h1>
		</a>
	</Sidebar.Header>
	<Sidebar.Content class="px-1 py-3">
		<Sidebar.Group>
			<Sidebar.GroupContent>
				<Sidebar.Menu class="gap-1.5">
					{#each items as item (item.title)}
						{#if item.subItems}
							<Collapsible.Root open={expandedSection === item.title} class="group/collapsible">
								<Sidebar.MenuItem>
									<Sidebar.MenuButton
										isActive={item.proxyActive}
										class="h-10 rounded-md px-3 text-sidebar-foreground/70 transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-transparent data-[active=true]:text-sidebar-foreground"
									>
										{#snippet child({ props })}
											{@const href = item.url ?? item.subItems?.[0].url ?? '#'}
											<div class="flex w-full items-center gap-2" {...props}>
												<a
													{href}
													onclick={() => (manuallyExpandedSection = item.title)}
													class="flex min-w-0 flex-1 items-center gap-2 text-inherit no-underline"
												>
													<item.icon class="size-4 shrink-0" />
													<span class="text-sm font-semibold">{item.title}</span>
												</a>
												<button
													type="button"
													aria-label={`Toggle ${item.title}`}
													onclick={(event) => {
														event.preventDefault();
														event.stopPropagation();
														toggleSection(item.title);
													}}
													class="ml-auto inline-flex size-6 items-center justify-center rounded text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
												>
													{#if expandedSection === item.title}
														<ChevronDown class="size-4 shrink-0" />
													{:else}
														<ChevronRight class="size-4 shrink-0" />
													{/if}
												</button>
											</div>
										{/snippet}
									</Sidebar.MenuButton>
									<Collapsible.Content>
										<Sidebar.MenuSub class="mx-0 mt-1 gap-1 border-l-0 px-0 py-0">
											{#each item.subItems as sub (sub.title)}
												<Sidebar.MenuSubItem class="relative">
													<Sidebar.MenuSubButton
														isActive={sub.active}
														class="h-9 rounded-none border-l-2 border-transparent py-2 pl-10 pr-3 text-sidebar-foreground/70 transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:border-[hsl(var(--brand))] data-[active=true]:bg-[hsl(var(--brand)/0.14)] data-[active=true]:font-medium data-[active=true]:text-[hsl(var(--brand))]"
													>
														{#snippet child({ props })}
															<a
																href={sub.url}
																onclick={() => (manuallyExpandedSection = item.title)}
																class="text-inherit"
																{...props}
															>
																<sub.icon class="size-4 shrink-0 !text-inherit" />
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
						{:else}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton
									isActive={item.active}
									class="h-10 rounded-md px-3 text-sidebar-foreground/70 transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-[hsl(var(--brand)/0.14)] data-[active=true]:font-medium data-[active=true]:text-[hsl(var(--brand))]"
								>
									{#snippet child({ props })}
										<a href={item.url} {...props}>
											<item.icon class="size-4 shrink-0" />
											<span class="text-sm font-semibold">{item.title}</span>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/if}
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Footer class="gap-3 p-3">
		<MaintenanceAlert />
		{#if auth.currentUser}
			<div class="flex items-center justify-between gap-2 rounded-lg p-2 text-sm">
				<div class="flex min-w-0 items-center gap-2">
					<User class="size-4 shrink-0 text-sidebar-foreground/70" />
					<span class="truncate font-medium">{auth.currentUser.full_name}</span>
				</div>
				<Button
					variant="ghost"
					size="icon"
					class="size-8 shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
					href={withBase('users/self')}
					aria-label="Edit profile"
				>
					<Edit class="size-4" />
				</Button>
			</div>
		{/if}
	</Sidebar.Footer>
</Sidebar.Root>
