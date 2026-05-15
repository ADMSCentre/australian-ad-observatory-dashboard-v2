<script lang="ts" generics="TData, TValue">
	import {
		type ColumnDef,
		type PaginationState,
		type SortingState,
		type ColumnFiltersState,
		type VisibilityState,
		type RowSelectionState,
		getCoreRowModel,
		getPaginationRowModel,
		getSortedRowModel,
		getFilteredRowModel,
		type Table
	} from '@tanstack/table-core';
	import * as TableComponent from '$lib/components/ui/table/index.js';
	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table';
	import { Button } from '$lib/components/ui/button';
	import Dropdown from '$lib/components/dropdown/dropdown.svelte';
	import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	type DataTableProps<TData, TValue> = {
		columns: ColumnDef<TData, TValue>[];
		data: TData[];
	};

	let {
		columns,
		data,
		before,
		children
	}: DataTableProps<TData, TValue> & {
		children?: Snippet;
		before?: (table: Table<TData>) => ReturnType<Snippet>;
	} = $props();

	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
	let sorting = $state<SortingState>([]);
	let columnFilters = $state<ColumnFiltersState>([]);
	let columnVisibility = $state<VisibilityState>({});
	let rowSelection = $state<RowSelectionState>({});

	const table = createSvelteTable({
		get data() {
			return data;
		},
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				pagination = updater(pagination);
			} else {
				pagination = updater;
			}
		},
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
		},
		onColumnFiltersChange: (updater) => {
			if (typeof updater === 'function') {
				columnFilters = updater(columnFilters);
			} else {
				columnFilters = updater;
			}
		},
		onColumnVisibilityChange: (updater) => {
			if (typeof updater === 'function') {
				columnVisibility = updater(columnVisibility);
			} else {
				columnVisibility = updater;
			}
		},
		onRowSelectionChange: (updater) => {
			if (typeof updater === 'function') {
				rowSelection = updater(rowSelection);
			} else {
				rowSelection = updater;
			}
		},
		state: {
			get pagination() {
				return pagination;
			},
			get sorting() {
				return sorting;
			},
			get columnFilters() {
				return columnFilters;
			},
			get columnVisibility() {
				return columnVisibility;
			},
			get rowSelection() {
				return rowSelection;
			}
		}
	});
</script>

<div class="w-full space-y-4">
	{#if before}
		{@render before(table)}
	{/if}
	<div class="overflow-hidden rounded-xl border border-border bg-card shadow-none">
		<TableComponent.Root>
			<TableComponent.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<TableComponent.Row class="bg-muted/50">
						{#each headerGroup.headers as header (header.id)}
							<TableComponent.Head
								class="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
							>
								{#if !header.isPlaceholder}
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>
								{/if}
							</TableComponent.Head>
						{/each}
					</TableComponent.Row>
				{/each}
			</TableComponent.Header>
			<TableComponent.Body>
				{#each table.getRowModel().rows as row (row.id)}
					<TableComponent.Row
						data-state={row.getIsSelected() && 'selected'}
						class="transition-colors duration-200 hover:bg-muted/40"
					>
						{#each row.getVisibleCells() as cell (cell.id)}
							<TableComponent.Cell class="text-sm">
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</TableComponent.Cell>
						{/each}
					</TableComponent.Row>
				{:else}
					<TableComponent.Row>
						<TableComponent.Cell
							colspan={columns.length}
							class="h-28 text-center text-sm text-muted-foreground"
							>No results.</TableComponent.Cell
						>
					</TableComponent.Row>
				{/each}
			</TableComponent.Body>
		</TableComponent.Root>
	</div>
	<!-- Pagination controls -->
	<div
		class="flex flex-col items-start justify-between gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm sm:flex-row sm:items-center"
	>
		<div class="flex items-center gap-2 text-muted-foreground">
			<span class="font-medium text-foreground">Rows per page</span>
			<Dropdown
				triggerClass="w-20 h-8"
				contentClass="w-20"
				options={[
					{
						value: 10,
						label: '10'
					},
					{
						value: 25,
						label: '25'
					},
					{
						value: 50,
						label: '50'
					},
					{
						value: 100,
						label: '100'
					}
				]}
				selected={pagination.pageSize}
				onSelected={(value) => {
					table.setPageSize(value);
				}}
			/>
		</div>
		<div class="flex flex-1 items-center justify-end gap-2">
			<span class="text-sm font-medium text-muted-foreground">
				Page {pagination.pageIndex + 1} of {table.getPageCount()}
			</span>
			<div class="flex items-center justify-end gap-1">
				<Button
					variant="outline"
					size="icon"
					class="size-8"
					onclick={() => table.firstPage()}
					disabled={!table.getCanPreviousPage()}
				>
					<ChevronFirst />
				</Button>
				<Button
					variant="outline"
					size="icon"
					class="size-8"
					onclick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					<ChevronLeft />
				</Button>
				<Button
					variant="outline"
					size="icon"
					class="size-8"
					onclick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					<ChevronRight />
				</Button>
				<Button
					variant="outline"
					size="icon"
					class="size-8"
					onclick={() => table.lastPage()}
					disabled={!table.getCanNextPage()}
				>
					<ChevronLast />
				</Button>
			</div>
		</div>
	</div>
</div>
