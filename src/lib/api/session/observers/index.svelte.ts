import { auth } from '$lib/api/auth/auth.svelte';
import { client } from '$lib/api/client';

export class ObserversApiAdapter {
	private data = $state<string[]>([]);

	async fetch() {
		const { data, error } = await client.GET('/observers', {
			headers: auth.headers
		});
		if (error) {
			console.error('Failed to fetch observers:', error);
			return;
		}
		if (!data) {
			console.error('No observers found');
			return;
		}
		this.data = data.map((o) => o.replace('/', ''));
	}

	get all() {
		return this.data;
	}

	get activationCodes() {
		return this.data.map((id) => {
			// The activation code is the 6 characters after the last character in the id
			return id.slice(-7).slice(0, 6);
		});
	}
}
