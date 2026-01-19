<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Checkbox from '$lib/components/ui/checkbox';
	import Label from '$lib/components/ui/label/label.svelte';
	import { exportsManager } from '../exports.svelte';
	import { DEFAULT_QUERY, type Query } from '../../mobile-observations/query/query';
	import { pushToast } from '$lib/components/toasts/toasts.svelte';
	import { AlertTriangle, LoaderCircle, ImageIcon, InfoIcon } from 'lucide-svelte';
	import * as Alert from '$lib/components/ui/alert';
	import QueryPreview from './query-preview.svelte';

	let {
		open = $bindable(false),
		query = DEFAULT_QUERY,
		isQueryEditable = true,
		onOpenChange
	}: {
		open?: boolean;
		query?: Query;
		isQueryEditable?: boolean;
		onOpenChange?: (isOpen: boolean) => void;
	} = $props();

	let queryState = $state<Query>({ ...query });
	let includeImages = $state(false);
	let selectedFields = $state<string[]>([]);
	let submitting = $state(false);
	let previewAdsCount = $state(0);

	// Check if query is valid (has a method set and has some args)
	const isQueryValid = $derived(
		queryState && queryState.method && queryState.args && queryState.args.length > 0
	);

	// Select default fields initially
	$effect(() => {
		if (exportsManager.fields.length > 0 && selectedFields.length === 0) {
			selectedFields = exportsManager.fields.filter((f) => f.is_default).map((f) => f.path);
		}
	});

	const toggleField = (fieldPath: string) => {
		if (selectedFields.includes(fieldPath)) {
			selectedFields = selectedFields.filter((f) => f !== fieldPath);
		} else {
			selectedFields = [...selectedFields, fieldPath];
		}
	};

	const selectAllFields = () => {
		selectedFields = exportsManager.fields.map((f) => f.path);
	};

	const selectDefaultFields = () => {
		selectedFields = exportsManager.fields.filter((f) => f.is_default).map((f) => f.path);
	};

	const clearFields = () => {
		selectedFields = [];
	};

	const handleSubmit = async () => {
		if (!isQueryValid) {
			pushToast({ type: 'error', message: 'Please build a query first', timeout: 5000 });
			return;
		}

		if (previewAdsCount === 0) {
			pushToast({ type: 'error', message: 'Please run the query first', timeout: 5000 });
			return;
		}

		// Check limits
		const limit = includeImages ? EXPORT_ADS_LIMITS.withImages : EXPORT_ADS_LIMITS.withoutImages;
		if (previewAdsCount > limit) {
			pushToast({
				type: 'error',
				message: `Query exceeds the ${limit} ads limit. Please refine your query.`,
				timeout: 5000
			});
			return;
		}

		submitting = true;
		try {
			const result = await exportsManager.createExport({
				query: queryState as unknown as Record<string, unknown>,
				include_images: includeImages,
				fields: selectedFields
			});

			if (result.success) {
				pushToast({ type: 'success', message: 'Export job created successfully', timeout: 3000 });
				resetForm();
				open = false;
			} else {
				pushToast({
					type: 'error',
					message: result.error || 'Failed to create export',
					timeout: 5000
				});
			}
		} finally {
			submitting = false;
		}
	};

	const resetForm = () => {
		queryState = { ...DEFAULT_QUERY };
		includeImages = false;
		selectedFields = exportsManager.fields.filter((f) => f.is_default).map((f) => f.path);
		previewAdsCount = 0;
	};

	const handleClose = () => {
		if (!submitting) {
			open = false;
		}
		if (onOpenChange) {
			onOpenChange(open);
		}
	};

	const EXPORT_ADS_LIMITS = {
		withImages: 10000,
		withoutImages: 50000
	};

	const isValidExport = $derived.by(() => {
		return selectedFields.length > 0 && previewAdsCount > 0 && !isLimitExceeded;
	});

	const isLimitExceeded = $derived.by(() => {
		const limit = includeImages ? EXPORT_ADS_LIMITS.withImages : EXPORT_ADS_LIMITS.withoutImages;
		return previewAdsCount > limit;
	});
</script>

<Dialog.Root bind:open onOpenChange={(isOpen) => !isOpen && handleClose()}>
	<Dialog.Content class="max-h-[90vh] max-w-7xl overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Create Export</Dialog.Title>
			<Dialog.Description>
				<span class="contents">
					Configure your export by building a query, selecting fields, and optionally including
					images.
				</span>
			</Dialog.Description>
		</Dialog.Header>

		<div class="flex flex-col gap-6 py-4">
			<!-- Export Expiration Warning -->
			<Alert.Root variant="default" class="border-blue-500 bg-blue-50 dark:bg-blue-950">
				<InfoIcon class="size-4 text-blue-600" />
				<Alert.Title class="text-blue-800 dark:text-blue-200">Export Expiration</Alert.Title>
				<Alert.Description class="text-blue-700 dark:text-blue-300">
					<span class="contents">
						Completed exports will expire and be automatically deleted after 7 days. Please download
						your exported data promptly to ensure you don't lose it.
					</span>
				</Alert.Description>
			</Alert.Root>

			<!-- Query Section -->
			<div class="flex flex-col gap-2">
				<Label class="text-base font-semibold">Query</Label>
				<p class="text-sm text-muted-foreground">
					Build a query to filter the data you want to export, then run it to preview results.
				</p>
				<QueryPreview
					bind:query={queryState}
					onResultsChange={(count) => {
						previewAdsCount = count;
					}}
					editable={isQueryEditable}
				/>
			</div>

			<!-- Fields Selection -->
			<div class="flex flex-col gap-2">
				<div class="flex items-center justify-between">
					<Label class="text-base font-semibold">Fields</Label>
					<div class="flex gap-2">
						<Button variant="ghost" size="sm" onclick={selectAllFields}>Select All</Button>
						<Button variant="ghost" size="sm" onclick={selectDefaultFields}>Defaults Only</Button>
						<Button variant="ghost" size="sm" onclick={clearFields}>Clear</Button>
					</div>
				</div>
				<p class="text-sm text-muted-foreground">
					Select which fields to include in the export. Default fields are pre-selected.
				</p>

				{#if exportsManager.fieldsLoading}
					<div class="flex items-center gap-2 py-4">
						<LoaderCircle class="size-4 animate-spin" />
						<span class="text-sm text-muted-foreground">Loading fields...</span>
					</div>
				{:else}
					<div class="grid max-h-60 grid-cols-2 gap-2 overflow-y-auto rounded-lg border p-4">
						{#each exportsManager.fields as field (field.id)}
							<div class="flex items-start gap-2">
								<Checkbox.Root
									checked={selectedFields.includes(field.path)}
									onCheckedChange={() => toggleField(field.path)}
									id={`field-${field.id}`}
									class="mt-0.5"
								/>
								<div class="flex flex-col">
									<Label for={`field-${field.id}`} class="cursor-pointer text-sm font-medium">
										{field.name}
										{#if field.is_default}
											<span class="ml-1 text-xs text-muted-foreground">(default)</span>
										{/if}
									</Label>
									<span class="text-xs text-muted-foreground">{field.description}</span>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Include Images Toggle -->
			<div class="flex flex-col gap-2">
				<div class="flex items-center gap-3">
					<Checkbox.Root bind:checked={includeImages} id="include-images" />
					<Label
						for="include-images"
						class="flex cursor-pointer items-center gap-2 text-base font-semibold"
					>
						Include Images
					</Label>
				</div>

				{#if includeImages}
					<Alert.Root variant="default" class="border-amber-500 bg-amber-50 dark:bg-amber-950">
						<AlertTriangle class="size-4 text-amber-600" />
						<Alert.Title class="text-amber-800 dark:text-amber-200"
							>Large Export Warning</Alert.Title
						>
						<Alert.Description class="text-amber-700 dark:text-amber-300">
							<span class="contents">
								Including images will significantly increase the size of the export file and the
								time taken to generate it. Only enable this if you specifically need the ad images.
							</span>
						</Alert.Description>
					</Alert.Root>
				{/if}

				{#if previewAdsCount > (includeImages ? EXPORT_ADS_LIMITS.withImages : EXPORT_ADS_LIMITS.withoutImages)}
					<Alert.Root variant="default" class="border-red-500 bg-red-50 dark:bg-red-950">
						<AlertTriangle class="size-4 text-red-600" />
						<Alert.Title class="text-red-800 dark:text-red-200">Query Exceeds Limit</Alert.Title>
						<Alert.Description class="text-red-700 dark:text-red-300">
							<span class="contents">
								Your query returned {previewAdsCount} ads, which exceeds the limit of
								{includeImages ? EXPORT_ADS_LIMITS.withImages : EXPORT_ADS_LIMITS.withoutImages}
								ads {includeImages ? 'with images' : ''}. Please refine your query to reduce the
								number of results.
							</span>
						</Alert.Description>
					</Alert.Root>
				{/if}
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={handleClose} disabled={submitting}>Cancel</Button>
			<Button
				onclick={handleSubmit}
				disabled={submitting || previewAdsCount === 0 || !isValidExport}
			>
				{#if submitting}
					<LoaderCircle class="mr-2 size-4 animate-spin" />
					Creating...
				{:else}
					Create Export
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
