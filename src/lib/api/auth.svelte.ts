import { getContext, setContext } from 'svelte';
import { MOBILE_OBSERVATIONS_API_URL } from './mobile-observations';

export type User = {
	token: string;
	payload: {
		username: string;
		full_name: string;
		exp: number;
	};
};

async function fetchLoginToken({ username, password }: { username: string; password: string }) {
	const data = {
		username,
		password
	};
	const response: {
		token: string;
		success: boolean;
	} = await fetch(MOBILE_OBSERVATIONS_API_URL + 'auth/login', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	}).then((res) => res.json());

	return response;
}

async function validateToken(token: string) {
	const response: {
		success: boolean;
		comment: string;
	} = await fetch(MOBILE_OBSERVATIONS_API_URL + 'auth/verify', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ token })
	}).then((res) => res.json());

	return response;
}

async function invalidateToken(token: string) {
	const response: {
		success: boolean;
		comment: string;
	} = await fetch(MOBILE_OBSERVATIONS_API_URL + 'auth/logout', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ token })
	}).then((res) => res.json());

	return response;
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
		if (!result.success) {
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
			const { success } = await validateToken(savedToken);
			if (!success) this.logout();
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
