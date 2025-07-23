import DataTableHeaderCell from '$lib/components/data-table/data-table-header-cell.svelte';
import type { ColumnDef } from '@tanstack/table-core';
import type { User } from '$lib/api/session/users/index.svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
import Dropdown from '$lib/components/dropdown/dropdown.svelte';
import DataTableActions from './data-table-actions.svelte';
import Input from '$lib/components/ui/input/input.svelte';
import { createRawSnippet } from 'svelte';
import type { Authentication } from '$lib/api/auth/auth.svelte';
import { client } from '$lib/api/client';
import { pushToast } from '$lib/components/toasts/toasts.svelte';

export const data = $state<{
	original: User[];
	changes: Partial<User>[];
	auth?: Authentication;
}>({
	original: [],
	changes: [],
	auth: undefined
});

const prepareUserUpdate = (username: string, updatedData: Partial<User>) => {
	updatedData = { ...updatedData, username };

	// Check if the user is already in the changes array, if not, add it
	if (!data.changes.find((change) => change.username === username)) {
		data.changes = [...data.changes, updatedData];
	}
	// Find the user in the changes array
	const changes = data.changes.find((change) => change.username === username);
	// If found, update the user with the changes
	if (changes) {
		data.changes = data.changes.map((change) => {
			if (change.username === username) {
				return { ...changes, ...updatedData, enabled: true };
			}
			return change;
		});
	}
};

/**
 * Converts the user object to a payload acceptable by the API, due to
 * the API expecting different keys than the user object
 * @param user The user object to prepare for the API
 * @returns The payload to send to the API
 */
const prepareUserPayload = (user: Partial<User>) => {
	const payload = { ...user } as Partial<User> & { full_name?: string };
	if (payload.fullname) {
		payload.full_name = payload.fullname || '';
		delete payload.fullname;
	}
	return payload;
};

const commitUserUpdate = async (username: string) => {
	// Call the API to update the user in the server
	const auth = data.auth;
	if (!auth || !auth.token) throw new Error('You must be logged in to update a user.');
	const changes = data.changes.find((change) => change.username === username);
	if (!changes) return;
	const { data: res, error } = await client.PATCH('/users/{username}', {
		headers: {
			Authorization: `Bearer ${auth.token}`
		},
		params: {
			path: { username }
		},
		body: prepareUserPayload({
			...changes
		})
	});
	if (!res?.success) throw new Error(res?.comment);
	if (error) throw error;

	// Update the original array with the changes to keep the UI in sync
	data.original = data.original.map((originalUser) => {
		if (originalUser.username === username) {
			const changes = data.changes.find((change) => change.username === username);
			if (changes) {
				return { ...originalUser, ...changes, enabled: true };
			}
		}
		return originalUser;
	});
};

const abortUserUpdate = (username: string) => {
	data.changes = data.changes.filter((change) => change.username !== username);
};

export const appendUser = async (user: User) => {
	const auth = data.auth;
	if (!auth || !auth.token) throw new Error('You must be logged in to create a user.');

	const body = prepareUserPayload(user);
	const { data: res, error } = await client.POST('/users', {
		headers: {
			Authorization: `Bearer ${auth.token}`
		},
		body: { ...body, enabled: true } as Omit<User, 'fullname'> & {
			full_name: string;
			enabled: boolean;
			password: string;
		}
	});
	if (!res && error) throw new Error(error.comment);
	if (!res?.success) throw new Error(res?.comment);
	data.original = [...data.original, user];
};

const deleteUser = async (username: string) => {
	const auth = data.auth;
	if (!auth || !auth.token) throw new Error('You must be logged in to delete a user.');
	const { data: res, error } = await client.DELETE('/users/{username}', {
		headers: {
			Authorization: `Bearer ${auth.token}`
		},
		params: {
			path: { username }
		}
	});
	if (!res && error) throw new Error(error.comment);
	if (!res?.success) throw new Error(res?.comment);
	data.original = data.original.filter((user) => user.username !== username);
};

export const columns: ColumnDef<User>[] = [
	{
		accessorKey: 'username',
		header: ({ column }) => {
			return renderComponent(DataTableHeaderCell, {
				label: 'Username',
				sortDir: column.getIsSorted(),
				onclick: () => column.toggleSorting()
			});
		},
		cell: ({ row }) => {
			const usernameCellSnippet = createRawSnippet<[string]>((getName) => {
				if (row.original.provider !== 'local') {
					return {
						render: () =>
							`<div style="direction: rtl" class="max-w-28 overflow-hidden text-muted-foreground text-ellipsis">${getName()}</div>`
					};
				}

				const username = getName();
				return {
					render: () => `<div class="w-28">${username}</div>`
				};
			});
			return renderSnippet(usernameCellSnippet, row.original.username);
		}
	},
	{
		accessorKey: 'provider',
		header: ({ column }) => {
			return renderComponent(DataTableHeaderCell, {
				label: 'Provider',
				sortDir: column.getIsSorted(),
				onclick: () => column.toggleSorting()
			});
		}
	},
	{
		accessorKey: 'fullname',
		header: ({ column }) => {
			return renderComponent(DataTableHeaderCell, {
				label: 'Full Name',
				sortDir: column.getIsSorted(),
				onclick: () => column.toggleSorting()
			});
		},
		cell: ({ row }) => {
			return renderComponent(Input, {
				type: 'text',
				value: row.original.fullname || '',
				disabled: !row.getIsSelected(),
				class: 'p-1 h-fit',
				onchange: (e) => {
					prepareUserUpdate(row.original.username, {
						fullname: (e.target as HTMLInputElement).value
					});
				}
			});
		}
	},
	{
		accessorKey: 'role',
		header: ({ column }) => {
			return renderComponent(DataTableHeaderCell, {
				label: 'Role',
				sortDir: column.getIsSorted(),
				onclick: () => column.toggleSorting()
			});
		},
		cell: ({ row }) => {
			return renderComponent(Dropdown, {
				selected: row.original.role,
				disabled: !row.getIsSelected(),
				triggerClass: 'p-1 h-fit w-32',
				contentClass: 'w-32',
				onSelected: (value) => {
					prepareUserUpdate(row.original.username, { role: value as User['role'] });
				},
				options: [
					{ label: 'Admin', value: 'admin' },
					{ label: 'User', value: 'user' }
				]
			});
		}
	},
	{
		accessorKey: 'password',
		header: 'Password',
		cell: ({ row }) => {
			if (row.original.provider !== 'local') {
				return renderSnippet(
					createRawSnippet(() => ({
						render: () => `<div class="text-muted-foreground select-none">Not applicable</div>`
					})),
					`${row.original.provider} user`
				);
			}

			return renderComponent(Input, {
				type: 'password',
				value: row.original.password,
				class: 'p-1 h-fit',
				disabled: !row.getIsSelected(),
				onchange: (e) => {
					prepareUserUpdate(row.original.username, {
						password: (e.target as HTMLInputElement).value
					});
				}
			});
		}
	},
	{
		header: 'Actions',
		cell: ({ row }) => {
			return renderComponent(DataTableActions, {
				user: row.original,
				isEditing: row.getIsSelected(),
				onEditStart: () => row.toggleSelected(true),
				onEditCancel: () => {
					abortUserUpdate(row.original.username);
					row.toggleSelected(false);
				},
				onEditConfirm: async () => {
					await commitUserUpdate(row.original.username);
					pushToast({
						message: `User "${row.original.username}" updated successfully`,
						type: 'success',
						timeout: 5000
					});
					row.toggleSelected(false);
				},
				onDelete: async () => {
					await deleteUser(row.original.username);
					pushToast({
						message: `User "${row.original.username}" deleted successfully`,
						type: 'success',
						timeout: 5000
					});
				}
			});
		}
	}
];
