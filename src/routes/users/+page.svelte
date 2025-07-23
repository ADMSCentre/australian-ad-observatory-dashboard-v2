<script lang="ts">
	import { auth } from '$lib/api/auth/auth.svelte';
	import UserTable from './user-table.svelte';
	import { data } from './columns.svelte';
	import { Circle } from 'svelte-loading-spinners';
	import { theme } from '$lib/states/theme.svelte';
	import { session } from '$lib/api/session/session.svelte';
	import ExternalUserList from './components/external-user-list.svelte';

	$effect(() => {
		const users = session.users.all;
		data.original = users;
		data.auth = auth;
	});
</script>

<h1>Users</h1>

<ExternalUserList />

<div class="flex w-full flex-col items-center">
	{#if session.users.loading}
		<Circle color={theme.colors.foreground} />
	{:else}
		<UserTable />
	{/if}
</div>

<!-- <pre>{JSON.stringify(data, null, 2)}</pre> -->
