import { getContext, setContext } from 'svelte';
import { client } from './client';
import { pushToast } from '$lib/components/toasts/toasts.svelte';

export type User = {
	token: string;
	payload: {
		username: string;
		full_name: string;
		role: string;
		exp: number;
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

async function invalidateToken(token: string) {
	const { data } = await client.POST('/auth/logout', { body: { token } });
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
		return payload;
	});

	login = async ({ username, password }: { username: string; password: string }) => {
		const result = await fetchLoginToken({ username, password });
		if (!result || !result.token) {
			throw new Error('Invalid credentials');
		}
		const { token } = result;
		this.token = token;
		localStorage.setItem('jwt', token);
	};

	logout = () => {
		invalidateToken(this.token!);
		this.token = null;
		localStorage.removeItem('jwt');
	};

	validate = async () => {
		this.loading = true;
		// const savedUser: User = JSON.parse(localStorage.getItem('user') || 'null');
		const savedToken = localStorage.getItem('jwt');
		if (!savedToken) {
			this.loading = false;
			return;
		}
		this.token = savedToken;
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

	constructor() {
		this.validate();
	}
}

const AUTH_KEY = Symbol('auth');

export function setAuthState() {
	return setContext(AUTH_KEY, new Authentication());
}

export function getAuthState() {
	return getContext<ReturnType<typeof setAuthState>>(AUTH_KEY);
}
