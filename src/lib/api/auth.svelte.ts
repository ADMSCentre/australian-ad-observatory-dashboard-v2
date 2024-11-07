import { getContext, setContext } from 'svelte';

const DASHBOARD_API_URL =
	'https://i7dy5tidoi.execute-api.us-east-2.amazonaws.com/default/fta-dashboard-instance';
type ApiActionType = 'presign' | 'platform_items_v3' | 'authenticate_educational';

export type User = {
	username: string;
	token: string;
};

async function useDashboardAPI({ actionType, data }: { actionType: ApiActionType; data: unknown }) {
	// The API uses base64 encoding - if we don't encode, the API will return a 500 error
	const jsonInput = btoa(
		JSON.stringify({
			action: actionType,
			data
		})
	);
	const response = await fetch(DASHBOARD_API_URL, {
		method: 'POST',
		body: jsonInput
	});
	if (!response.ok) {
		throw new Error(`Failed to fetch ${actionType} with status ${response.status}`);
	}
	return response.json();
}

async function fetchLoginToken({ username, password }: { username: string; password: string }) {
	const data = {
		username,
		password
	};

	const response: {
		session_token: string;
		success: boolean;
	} = await useDashboardAPI({ actionType: 'authenticate_educational', data });

	return response;
}

async function presignToken(token: string) {
	const data = {
		session_token: token,
		json: []
	};

	const response: {
		success: boolean;
		presigned_urls: string[];
		comment: string;
	} = await useDashboardAPI({ actionType: 'presign', data });

	return response;
}
export class Authentication {
	currentUser = $state<User | null>(null);
	loading = $state(false);

	login = async ({ username, password }: { username: string; password: string }) => {
		const result = await fetchLoginToken({ username, password });
		if (!result.success) {
			throw new Error('Invalid credentials');
		}
		const { session_token: token } = result;
		this.currentUser = { username, token };
		// Save the token to local storage
		localStorage.setItem('user', JSON.stringify(this.currentUser));
	};

	presign = async () => {
		this.loading = true;
		const savedUser: User = JSON.parse(localStorage.getItem('user') || 'null');
		if (!savedUser) {
			this.loading = false;
			return;
		}
		const { token } = savedUser;
		// Check if the token is still valid
		try {
			const status = await presignToken(token);
			if (status.comment === 'SESSION_TOKEN_EXPIRED') {
				// Remove the token from local storage
				localStorage.removeItem('user');
			} else {
				this.currentUser = savedUser;
			}
		} catch (e) {
			console.error(e);
		} finally {
			this.loading = false;
		}
	};

	logout = () => {
		this.currentUser = null;
		localStorage.removeItem('user');
	};

	constructor() {
		this.presign();
	}
}

const AUTH_KEY = Symbol('auth');

export function setAuthState() {
	return setContext(AUTH_KEY, new Authentication());
}

export function getAuthState() {
	return getContext<ReturnType<typeof setAuthState>>(AUTH_KEY);
}
