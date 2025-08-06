import { client } from '../client';
import { pushToast } from '$lib/components/toasts/toasts.svelte';
import { session } from '../session/session.svelte';

export type User = {
	token: string;
	payload: {
		enabled: boolean;
		exp: number;
		full_name: string;
		iat: number;
		provider: 'cilogon' | 'local' | null;
		role: string;
		sub: string;
	};
};

async function fetchLoginToken({ username, password }: { username: string; password: string }) {
	const { data } = await client.POST('/auth/login', {
		body: {
			username,
			password
		}
	});
	return data;
}

async function validateToken(token: string) {
	const { data } = await client.POST('/auth/verify', { body: { token } });
	return data;
}

export class Authentication {
	token = $state<string | null>(null);
	loading = $state(false);

	currentUser = $derived.by<User['payload'] | null>(() => {
		if (!this.token) {
			return null;
		}
		const payload = JSON.parse(atob(this.token.split('.')[1]));
		console.log('Current user payload:', payload);
		return payload;
	});

	isGuest = $derived.by(() => {
		return !this.currentUser || this.currentUser.role === 'guest';
	});

	headers = $derived.by(() => {
		if (!this.token) return {};
		return {
			Authorization: `Bearer ${this.token}`
		};
	});

	login = async ({ username, password }: { username: string; password: string }) => {
		const result = await fetchLoginToken({ username, password });
		if (!result || !result.token) {
			throw new Error('Invalid credentials');
		}
		const { token } = result;
		this.setTokenFromOAuth(token);
	};

	logout = () => {
		this.token = null;
		localStorage.removeItem('jwt');
		window.location.reload();
	};

	validate = async () => {
		this.loading = true;
		// const savedUser: User = JSON.parse(localStorage.getItem('user') || 'null');
		const savedToken = localStorage.getItem('jwt');
		if (!savedToken) {
			this.loading = false;
			return;
		}
		this.setTokenFromOAuth(savedToken);
		// Check if the token is still valid
		try {
			const result = await validateToken(savedToken);
			// If the token is invalid, log out
			if (!result || !result.success) {
				this.logout();
				pushToast({
					type: 'error',
					message: 'Your session has expired. Please log in again.',
					timeout: 5000
				});
				return;
			}
		} catch (e) {
			console.error(e);
		} finally {
			this.loading = false;
		}
	};

	setTokenFromOAuth = (receivedToken: string) => {
		this.token = receivedToken;
		localStorage.setItem('jwt', receivedToken);
		session.refresh();
	};

	constructor() {
		this.validate();
	}
}

export const auth = new Authentication();
