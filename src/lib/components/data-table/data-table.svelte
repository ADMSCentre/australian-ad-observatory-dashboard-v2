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
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as TableComponent from '$lib/components/ui/table/index.js';
	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table';
	import { Input } from '$lib/components/ui/input';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import Dropdown from '$lib/components/dropdown/dropdown.svelte';
	import CreateUserDialog from '../../../routes/users/create-user-dialog.svelte';
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

<div class="w-full">
	{#if before}
		{@render before(table)}
	{/if}
	<div class="rounded-md border">
		<TableComponent.Root>
			<TableComponent.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<TableComponent.Row>
						{#each headerGroup.headers as header (header.id)}
							<TableComponent.Head>
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
					<TableComponent.Row data-state={row.getIsSelected() && 'selected'}>
						{#each row.getVisibleCells() as cell (cell.id)}
							<TableComponent.Cell>
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</TableComponent.Cell>
						{/each}
					</TableComponent.Row>
				{:else}
					<TableComponent.Row>
						<TableComponent.Cell colspan={columns.length} class="h-24 text-center"
							>No results.</TableComponent.Cell
						>
					</TableComponent.Row>
				{/each}
			</TableComponent.Body>
		</TableComponent.Root>
	</div>
	<!-- Pagination controls -->
	<div class="sm: flex flex-col items-center justify-end gap-1 sm:flex-row sm:gap-4">
		<div>
			Rows per page:
			<Dropdown
				triggerClass="w-20"
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
		<div class="flex flex-1 items-center">
			<span class="p-2 text-sm font-medium">
				Page {pagination.pageIndex + 1} of {table.getPageCount()}
			</span>
			<div class="flex items-center justify-end space-x-2 p-2">
				<Button
					variant="outline"
					size="icon"
					onclick={() => table.firstPage()}
					disabled={!table.getCanPreviousPage()}
				>
					<ChevronFirst />
				</Button>
				<Button
					variant="outline"
					size="icon"
					onclick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					<ChevronLeft />
				</Button>
				<Button
					variant="outline"
					size="icon"
					onclick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					<ChevronRight />
				</Button>
				<Button
					variant="outline"
					size="icon"
					onclick={() => table.lastPage()}
					disabled={!table.getCanNextPage()}
				>
					<ChevronLast />
				</Button>
			</div>
		</div>
	</div>
</div>
