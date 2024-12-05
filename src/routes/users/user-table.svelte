<script lang="ts">
	import { columns } from './columns.svelte';
	import DataTable from './data-table.svelte';

	import { data } from './columns.svelte';
</script>

<DataTable data={data.original} {columns} />
