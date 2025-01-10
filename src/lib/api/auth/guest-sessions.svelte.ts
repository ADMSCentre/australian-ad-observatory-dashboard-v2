import { auth } from '$lib/api/auth/auth.svelte';
import { client } from '$lib/api/client';

// Module for managing sharing session (making an observer's data public)
export type Session = {
	/** @description A unique identifier for the session. */
	key: string;
	/** @description The time in seconds until the session expires. */
	expiration_time?: number;
	/** @description A description of the session. */
	description?: string;
};

// const sessionsWrapper = $state<{
// 	sessions: {
// 		key?: string;
// 		data?: Record<string, never>;
// 	}[];
// }>({
// 	sessions: []
// });

// export const sessions = sessionsWrapper.sessions;

class GuestSessions {
	sessions: {
		key?: string;
		data?: Record<string, never>;
	}[] = $state([]);

	sync = async () => {
		const { data, error } = await client.GET('/guests', {
			headers: {
				Authorization: `Bearer ${auth.token}`
			}
		});
		if (error) {
			console.error(error);
			return;
		}
		this.sessions = data.toSorted((a, b) => {
			// Sort by data.exp (expiration time)
			const diff = (a.data?.exp || 0) - (b.data?.exp || 0);
			return Math.sign(diff);
		});
	};

	create = async ({
		key,
		description,
		expirationTime
	}: {
		key: string;
		description: string;
		expirationTime: number;
	}) => {
		const { data, error } = await client.POST('/guests', {
			body: {
				key: key,
				expiration_time: expirationTime,
				description
			},
			headers: {
				Authorization: `Bearer ${auth.token}`
			}
		});
		if (error || !data.success) {
			console.error('An error occurred while creating the guest session:', error);
			return;
		}
		await this.sync();
	};

	delete = async (key: string) => {
		const { data, error } = await client.DELETE('/guests/{key}', {
			params: {
				path: {
					key
				}
			},
			headers: {
				Authorization: `Bearer ${auth.token}`
			}
		});
		if (error || !data.success) {
			console.error('An error occurred while deleting the guest session:', error);
			return;
		}
		await this.sync();
	};

	getToken = async (key: string) => {
		const { data, error } = await client.GET('/guests/{key}', {
			params: {
				path: {
					key
				}
			}
		});
		if (error || !data.success) {
			return null;
		}
		return data.token || null;
	};

	find = (key: string) => {
		return this.sessions.find((session) => session.key === key);
	};
}

export const guestSessions = new GuestSessions();
guestSessions.sync();
