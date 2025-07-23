import { auth } from '$lib/api/auth/auth.svelte';
import { client } from '$lib/api/client';
import { getContext, setContext } from 'svelte';

export type ExternalUser = {
	id: string;
	provider: string;
	provider_user_id: string;
	enabled: boolean;
	full_name: string;
	role: string;
	email: string;
	created_at: number;
};

class ExternalUserContext {
	private _items = $state<ExternalUser[]>([]);
	private _loading = $state<boolean>(false);
	private _error = $state<string | null>(null);

	async fetch() {
		if (!auth.token) {
			this._error = 'Not authenticated';
			return;
		}
		this._loading = true;
		const { data, error } = await client.GET('/users/external', {
			headers: auth.headers
		});
		if (error) {
			this._error = error instanceof Error ? error.message : 'Unknown error';
			return;
		}

		this._items = data.reduce<ExternalUser[]>((acc, user) => {
			if (
				!user.id ||
				!user.provider ||
				!user.provider_user_id ||
				!user.role ||
				!user.created_at ||
				user.enabled === undefined
			) {
				return acc;
			}
			acc.push({
				id: user.id,
				provider: user.provider,
				provider_user_id: user.provider_user_id,
				enabled: user.enabled,
				full_name: user.full_name || '',
				role: user.role,
				created_at: user.created_at,
				email: user.email || ''
			});
			return acc;
		}, []);
	}

	async delete(user: ExternalUser) {
		if (!auth.token) throw new Error('Not authenticated');
		const { error } = await client.DELETE('/users/external/{user_id}', {
			headers: auth.headers,
			params: {
				path: {
					user_id: user.id
				}
			}
		});
		if (error) throw error;
		await this.fetch();
	}

	async approve(user: ExternalUser) {
		if (!auth.token) throw new Error('Not authenticated');
		const { error } = await client.POST('/users/external/{user_id}/enable', {
			headers: auth.headers,
			params: {
				path: {
					user_id: user.id
				}
			}
		});
		if (error) throw error;
		await this.fetch();
	}

	async disable(user: ExternalUser) {
		if (!auth.token) throw new Error('Not authenticated');
		const { error } = await client.POST('/users/external/{user_id}/disable', {
			headers: auth.headers,
			params: {
				path: {
					user_id: user.id
				}
			}
		});
		if (error) throw error;
		await this.fetch();
	}

	get items() {
		return this._items;
	}

	get loading() {
		return this._loading;
	}

	get error() {
		return this._error;
	}
}

const EXTERNAL_USER_CONTEXT = Symbol('externalUserContext');

export function setExternalUserContext() {
	const context = new ExternalUserContext();
	setContext(EXTERNAL_USER_CONTEXT, context);
	context.fetch();
	return context;
}

export function getExternalUserContext() {
	const context = getContext<ExternalUserContext>(EXTERNAL_USER_CONTEXT);
	if (!context) {
		throw new Error('ExternalUserContext not set. Use setExternalUserContext() first.');
	}
	return context;
}
