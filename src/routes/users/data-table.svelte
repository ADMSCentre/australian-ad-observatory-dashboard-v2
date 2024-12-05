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
		getFilteredRowModel
	} from '@tanstack/table-core';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table';
	import { Input } from '$lib/components/ui/input';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import Dropdown from '$lib/components/dropdown/dropdown.svelte';
	import CreateUserDialog from './create-user-dialog.svelte';
	import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-svelte';

	type DataTableProps<TData, TValue> = {
		columns: ColumnDef<TData, TValue>[];
		data: TData[];
	};

	let { columns, data }: DataTableProps<TData, TValue> = $props();

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
	<div class="flex items-center justify-between gap-4 py-4">
		<Input
			placeholder="Filter username..."
			value={(table.getColumn('username')?.getFilterValue() as string) ?? ''}
			onchange={(e) => {
				table.getColumn('username')?.setFilterValue(e.currentTarget.value);
			}}
			oninput={(e) => {
				table.getColumn('username')?.setFilterValue(e.currentTarget.value);
			}}
			class="max-w-sm"
		/>
		<CreateUserDialog />
	</div>
	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row>
						{#each headerGroup.headers as header (header.id)}
							<Table.Head>
								{#if !header.isPlaceholder}
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>
								{/if}
							</Table.Head>
						{/each}
					</Table.Row>
				{/each}
			</Table.Header>
			<Table.Body>
				{#each table.getRowModel().rows as row (row.id)}
					<Table.Row data-state={row.getIsSelected() && 'selected'}>
						{#each row.getVisibleCells() as cell (cell.id)}
							<Table.Cell>
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</Table.Cell>
						{/each}
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="h-24 text-center">No results.</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<!-- Pagination controls -->
	<div class="flex items-center justify-end gap-4">
		<div>
			Rows per page:
			<Dropdown
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
		<span class="text-sm font-medium">
			Page {pagination.pageIndex + 1} of {table.getPageCount()}
		</span>
		<div class="flex items-center justify-end space-x-2 py-4">
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
