<script lang="ts">
	import { getAuthState } from '$lib/api/auth.svelte';
	import { client } from '$lib/api/client';
	import { onMount } from 'svelte';
	import type { User } from './types';
	import UserTable from './user-table.svelte';
	import { data } from './columns.svelte';
	import { Circle } from 'svelte-loading-spinners';
	import { theme } from '$lib/states/theme.svelte';

	const auth = getAuthState();
	let loading = $state(true);

	const fetchUsers = async (): Promise<User[]> => {
		const { data, error } = await client.GET('/users', {
			headers: {
				Authorization: `Bearer ${auth.token}`
			}
		});
		if (error) {
			console.error(error);
			return [];
		}
		return (data as any).map(
			(user: { full_name: string; username: string; password: string; role: string }) => {
				user.role ??= 'user';

				return {
					fullname: user.full_name,
					username: user.username,
					password: user.password,
					role: user.role
				};
			}
		);
	};

	// const fetchUsers = async (): Promise<User[]> => {
	// 	return [
	// 		{
	// 			fullname: 'John Doe',
	// 			username: 'johndoe',
	// 			password: 'password',
	// 			role: 'admin'
	// 		},
	// 		{
	// 			fullname: 'Jane Doe',
	// 			username: 'janedoe',
	// 			password: 'password',
	// 			role: 'user'
	// 		},
	// 		{
	// 			fullname: 'Alice Smith',
	// 			username: 'alicesmith',
	// 			password: 'password',
	// 			role: 'user'
	// 		},
	// 		{
	// 			fullname: 'Bob Johnson',
	// 			username: 'bobjohnson',
	// 			password: 'password',
	// 			role: 'admin'
	// 		},
	// 		{
	// 			fullname: 'Charlie Brown',
	// 			username: 'charliebrown',
	// 			password: 'password',
	// 			role: 'user'
	// 		},
	// 		{
	// 			fullname: 'David Wilson',
	// 			username: 'davidwilson',
	// 			password: 'password',
	// 			role: 'user'
	// 		},
	// 		{
	// 			fullname: 'Eve Davis',
	// 			username: 'evedavis',
	// 			password: 'password',
	// 			role: 'admin'
	// 		},
	// 		{
	// 			fullname: 'Frank Miller',
	// 			username: 'frankmiller',
	// 			password: 'password',
	// 			role: 'user'
	// 		},
	// 		{
	// 			fullname: 'Grace Lee',
	// 			username: 'gracelee',
	// 			password: 'password',
	// 			role: 'user'
	// 		},
	// 		{
	// 			fullname: 'Hank Moore',
	// 			username: 'hankmoore',
	// 			password: 'password',
	// 			role: 'admin'
	// 		},
	// 		{
	// 			fullname: 'Ivy Taylor',
	// 			username: 'ivytaylor',
	// 			password: 'password',
	// 			role: 'user'
	// 		},
	// 		{
	// 			fullname: 'Jack Anderson',
	// 			username: 'jackanderson',
	// 			password: 'password',
	// 			role: 'user'
	// 		},
	// 		{
	// 			fullname: 'Karen Thomas',
	// 			username: 'karenthomas',
	// 			password: 'password',
	// 			role: 'admin'
	// 		},
	// 		{
	// 			fullname: 'Leo Martinez',
	// 			username: 'leomartinez',
	// 			password: 'password',
	// 			role: 'user'
	// 		},
	// 		{
	// 			fullname: 'Mia Robinson',
	// 			username: 'miarobinson',
	// 			password: 'password',
	// 			role: 'user'
	// 		},
	// 		{
	// 			fullname: 'Noah Clark',
	// 			username: 'noahclark',
	// 			password: 'password',
	// 			role: 'admin'
	// 		},
	// 		{
	// 			fullname: 'Olivia Lewis',
	// 			username: 'olivialewis',
	// 			password: 'password',
	// 			role: 'user'
	// 		},
	// 		{
	// 			fullname: 'Paul Walker',
	// 			username: 'paulwalker',
	// 			password: 'password',
	// 			role: 'user'
	// 		},
	// 		{
	// 			fullname: 'Quinn Hall',
	// 			username: 'quinnhall',
	// 			password: 'password',
	// 			role: 'admin'
	// 		},
	// 		{
	// 			fullname: 'Rachel Allen',
	// 			username: 'rachelallen',
	// 			password: 'password',
	// 			role: 'user'
	// 		},
	// 		{
	// 			fullname: 'Sam Young',
	// 			username: 'samyoung',
	// 			password: 'password',
	// 			role: 'user'
	// 		},
	// 		{
	// 			fullname: 'Tina King',
	// 			username: 'tinaking',
	// 			password: 'password',
	// 			role: 'admin'
	// 		}
	// 	];
	// };

	onMount(async () => {
		loading = true;
		const users = await fetchUsers();
		data.original = users;
		data.auth = auth;
		loading = false;
	});
</script>

<h1>Users</h1>

<div class="flex w-full flex-col items-center">
	{#if loading}
		<Circle color={theme.colors.foreground} />
	{:else}
		<UserTable />
	{/if}
</div>

<!-- <pre>{JSON.stringify(data, null, 2)}</pre> -->
