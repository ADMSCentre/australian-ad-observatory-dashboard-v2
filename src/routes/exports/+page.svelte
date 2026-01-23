<script lang="ts">
	import { onMount } from 'svelte';
	import { exportsManager } from './exports.svelte';
	import { session } from '$lib/api/session/session.svelte';
	import { auth } from '$lib/api/auth/auth.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import {
		Plus,
		ClockIcon,
		LoaderCircle,
		Check,
		CircleX,
		Download,
		Users,
		ChevronDown,
		ChevronRight,
		Trash2,
		RefreshCcw,
		SaveOff
	} from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import CreateExportDialog from './components/create-export-dialog.svelte';
	import ManageAccessDialog from './components/manage-access-dialog.svelte';
	import ExportDetails from './components/export-details.svelte';
	import type { Export } from './types';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { pushToast } from '$lib/components/toasts/toasts.svelte';
	import type { Query } from 'mobile-observations/query/query';

	let createDialogOpen = $state(false);
	let manageAccessDialogOpen = $state(false);
	let selectedExport = $state<Export | null>(null);
	let expandedExportIds = $state<Set<string>>(new Set());

	onMount(async () => {
		await Promise.all([
			exportsManager.fetchExports(),
			exportsManager.fetchFields(),
			session.users.fetch()
		]);
	});

	const POLL_INTERVAL = 10000; // 10 seconds
	let pollTimer = $state<ReturnType<typeof setInterval> | null>(null);

	// Polling mechanism to refresh exports with 'pending' or 'processing' status
	onMount(() => {
		pollTimer = setInterval(async () => {
			const processingItems = exportsManager.sorted.filter(
				(exportItem) => exportItem.status === 'pending' || exportItem.status === 'processing'
			);
			if (processingItems.length > 0) {
				await exportsManager.refreshExports({
					targets: processingItems.map((item) => item.export_id)
				});
			}
		}, POLL_INTERVAL);

		return () => {
			if (pollTimer !== null) {
				clearInterval(pollTimer);
				pollTimer = null;
			}
		};
	});

	const toggleExpanded = (exportId: string) => {
		const newSet = new Set(expandedExportIds);
		if (newSet.has(exportId)) {
			newSet.delete(exportId);
		} else {
			newSet.add(exportId);
		}
		expandedExportIds = newSet;
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'pending':
				return ClockIcon;
			case 'processing':
				return LoaderCircle;
			case 'completed':
				return Check;
			case 'failed':
				return CircleX;
			case 'expired':
				return SaveOff;
			default:
				return ClockIcon;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'pending':
				return 'text-yellow-500';
			case 'processing':
				return 'text-blue-500';
			case 'completed':
				return 'text-green-500';
			case 'failed':
				return 'text-red-500';
			case 'expired':
				return 'text-red-500';
			default:
				return 'text-muted-foreground';
		}
	};

	const formatDate = (dateStr: string | null) => {
		if (!dateStr) return '-';
		// Ensure we interpret the incoming timestamp as UTC. If it lacks timezone
		// information, append 'Z' so Date parses it as UTC, then render in local time.
		const hasTimezone = /[zZ]$|[+\-]\d{2}(:?\d{2})?$/.test(dateStr);
		const iso = hasTimezone ? dateStr : `${dateStr}Z`;
		const date = new Date(iso);
		if (Number.isNaN(date.getTime())) return '-';
		return date.toLocaleString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const getUserDisplayName = (userId: string): string => {
		const user = session.users.all.find((u) => u.id === userId);
		return user?.fullname || user?.username || userId.slice(0, 8) + '...';
	};

	const formatQuery = (q: Query): string => {
		if (!q) return 'No query';
		if (typeof q === 'string') return q;

		const method = q.method;
		const args = q.args || [];

		if (args.length === 0) return method;

		const formattedArgs = args.map((arg) => {
			if (typeof arg === 'string') return `"${arg}"`;
			return formatQuery(arg as Query);
		});

		return `${method}(${formattedArgs.join(', ')})`;
	};

	const isCreator = (exportItem: Export): boolean => {
		return exportItem.creator_id === auth.currentUser?.sub;
	};

	const handleManageAccess = (exportItem: Export) => {
		selectedExport = exportItem;
		manageAccessDialogOpen = true;
	};

	const handleDownload = (url: string) => {
		window.open(url, '_blank');
	};

	const handleDelete = async (exportItem: Export) => {
		if (!confirm('Are you sure you want to delete this export?')) return;

		const result = await exportsManager.deleteExport(exportItem.export_id);
		if (result.success) {
			pushToast({ type: 'success', message: 'Export deleted successfully', timeout: 3000 });
		} else {
			pushToast({
				type: 'error',
				message: result.error || 'Failed to delete export',
				timeout: 5000
			});
		}
	};
</script>

<svelte:head>
	<title>Exports</title>
	<meta name="description" content="Manage data exports" />
</svelte:head>

<div class="flex flex-col gap-6 p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold">Exports</h1>
			<p class="text-muted-foreground">Create and manage data exports</p>
		</div>
		<Button onclick={() => (createDialogOpen = true)}>
			<Plus class="mr-2 size-4" />
			Create Export
		</Button>
	</div>

	{#if exportsManager.loading}
		<div class="flex items-center justify-center py-12">
			<LoaderCircle class="size-8 animate-spin text-muted-foreground" />
		</div>
	{:else if exportsManager.sorted.length === 0}
		<div
			class="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-12"
		>
			<p class="text-muted-foreground">No exports yet</p>
			<Button variant="outline" onclick={() => (createDialogOpen = true)}>
				<Plus class="mr-2 size-4" />
				Create your first export
			</Button>
		</div>
	{:else}
		<div class="flex flex-col gap-2">
			{#each exportsManager.sorted as exportItem (exportItem.export_id)}
				{@const StatusIcon = getStatusIcon(exportItem.status)}
				{@const isExpanded = expandedExportIds.has(exportItem.export_id)}
				<div class="rounded-lg border bg-card">
					<div class="flex items-center gap-4 p-4">
						<!-- Expand button -->
						<button
							class="flex size-6 items-center justify-center rounded hover:bg-muted"
							onclick={() => toggleExpanded(exportItem.export_id)}
						>
							{#if isExpanded}
								<ChevronDown class="size-4" />
							{:else}
								<ChevronRight class="size-4" />
							{/if}
						</button>

						<!-- Status icon -->
						<Tooltip.Root>
							<Tooltip.Trigger>
								<div class={cn('flex items-center', getStatusColor(exportItem.status))}>
									<StatusIcon
										class={cn('size-5', exportItem.status === 'processing' && 'animate-spin')}
									/>
								</div>
							</Tooltip.Trigger>
							<Tooltip.Content>
								{#if exportItem.status === 'failed' && exportItem.message}
									<p class="max-w-xs">{exportItem.message}</p>
									<p class="text-xs text-muted-foreground">Please contact support for help.</p>
								{:else if exportItem.status === 'pending'}
									<p class="capitalize">Your export is being queued for processing.</p>
								{:else if exportItem.status === 'processing'}
									<p class="capitalize">Your export is currently being processed.</p>
								{:else}
									<p class="capitalize">{exportItem.status.replace('_', ' ')}</p>
								{/if}
							</Tooltip.Content>
						</Tooltip.Root>

						<!-- Export ID -->
						<div class="flex-1">
							<p class="font-mono text-sm">{formatQuery(exportItem.export_parameters.query)}</p>
						</div>

						<!-- Created date -->
						<div class="text-sm text-muted-foreground">
							<p>Created: {formatDate(exportItem.created_at)}</p>
							{#if exportItem.completed_at}
								<p>Completed: {formatDate(exportItem.completed_at)}</p>
							{/if}
						</div>

						<!-- Actions -->
						<div class="flex items-center gap-2">
							{#if isCreator(exportItem)}
								<Button variant="outline" size="sm" onclick={() => handleManageAccess(exportItem)}>
									{exportItem.shared_with.length + 1}
									<Users class="mr-1 size-4" />
									Manage Access
								</Button>
							{/if}

							{#if exportItem.status === 'completed' && exportItem.url}
								<Button variant="default" size="sm" onclick={() => handleDownload(exportItem.url!)}>
									<Download class="mr-1 size-4" />
									Download
								</Button>
							{/if}

							{#if exportItem.status === 'failed' || (exportItem.status === 'expired' && isCreator(exportItem))}
								<Button
									variant="ghost"
									size="sm"
									class="text-destructive hover:text-destructive"
									onclick={() => exportsManager.retryExport(exportItem.export_id)}
								>
									<RefreshCcw class="size-4" />
									Retry
								</Button>
							{/if}

							{#if isCreator(exportItem)}
								<Button
									variant="ghost"
									size="sm"
									class="text-destructive hover:text-destructive"
									onclick={() => handleDelete(exportItem)}
								>
									<Trash2 class="size-4" />
								</Button>
							{/if}
						</div>
					</div>

					<!-- Expanded details -->
					{#if isExpanded}
						<div class="border-t p-4">
							<ExportDetails {exportItem} />
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<CreateExportDialog bind:open={createDialogOpen} />

{#if selectedExport}
	<ManageAccessDialog
		bind:open={manageAccessDialogOpen}
		exportItem={selectedExport}
		onClose={() => (selectedExport = null)}
	/>
{/if}
