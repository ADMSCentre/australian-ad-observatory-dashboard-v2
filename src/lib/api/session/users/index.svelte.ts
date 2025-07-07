import { auth } from '$lib/api/auth/auth.svelte';
import { client } from '$lib/api/client';

const userRoles = ['admin', 'user'] as const;
export type UserRole = (typeof userRoles)[number];

function parseRole(role: string | undefined): UserRole {
	const maybeRole = userRoles.find((r) => r === role);
	if (!maybeRole) return 'user';
	return maybeRole;
}

export type User = {
	username: string;
	fullname: string;
	password?: string; // Hashed
	role: UserRole;
};

export class UsersApi {
	private authHeader = $derived.by(() => {
		return { Authorization: `Bearer ${auth.token}` };
	});
	private users = $state<User[]>([]);
	loading = $state(false);

	get all() {
		return this.users;
	}

	async fetch() {
		if (!auth.token) throw new Error('Not authenticated');
		this.loading = true;
		const { data, error } = await client.GET('/users', { headers: this.authHeader });
		if (error) {
			this.loading = false;
			throw error;
		}
		this.loading = false;
		this.users = data
			.filter((user) => user.username)
			.map((user) => {
				if (!user.username) throw new Error('Invalid user data');

				return {
					fullname: user.full_name || '',
					username: user.username,
					role: parseRole(user.role)
				};
			});
	}
}
