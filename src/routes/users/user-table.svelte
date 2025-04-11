<script lang="ts">
	import { columns } from './columns.svelte';
	import DataTable from '../../lib/components/data-table/data-table.svelte';

	import { data } from './columns.svelte';
	import { Input } from '$lib/components/ui/input';
	import CreateUserDialog from './create-user-dialog.svelte';
</script>

<DataTable data={data.original} {columns}>
	{#snippet before(table)}
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
	{/snippet}
</DataTable>
