import { auth } from '$lib/api/auth/auth.svelte';
import { client } from '$lib/api/client';
import type { BasicAdData } from '../ads/types';
import { session } from '../session.svelte';

export interface Tag {
	id: string;
	name: string;
	description: string;
	hex: string;
}

export class TagApiAdapter {
	private data = $state<Tag[]>();
	loading = $state<boolean>(false);
	error = $state<string | null>(null);

	async fetch(): Promise<void> {
		if (!auth.token) throw new Error('Not authenticated');
		this.loading = true;
		const { data, error } = await client.GET('/tags', { headers: auth.headers });
		if (error) {
			this.loading = false;
			this.error = `${error}` || 'Failed to fetch tags';
			throw error;
		}
		this.loading = false;
		this.data = data;
	}

	get all(): Tag[] {
		return this.data || [];
	}

	/** Read a single tag by its ID */
	getById(id: string): Tag | undefined {
		if (!this.data) return undefined;
		return this.data.find((tag) => tag.id === id);
	}

	/** Create a new tag */
	async create(payload: Omit<Tag, 'id'>): Promise<Tag> {
		const { data, error } = await client.POST('/tags', {
			body: payload,
			headers: auth.headers
		});
		if (error) {
			throw error;
		}
		const createdTag = data.tag;
		if (!createdTag || !createdTag.id) {
			throw new Error('Failed to create tag: Invalid response' + JSON.stringify(data));
		}
		const newTag: Tag = createdTag;
		this.data = [...(this.data || []), newTag];
		return newTag;
		// const newTag: Tag = {
		// 	id: crypto.randomUUID(),
		// 	...payload
		// };
		// this.data = [...(this.data || []), newTag];
		// return newTag;
	}

	/** Update an existing tag */
	async update(updated: Tag): Promise<Tag | undefined> {
		// if (!this.data) return undefined;
		// const idx = this.data.findIndex((tag) => tag.id === updated.id);
		// if (idx === -1) return undefined;
		// const newList = [...this.data];
		// newList[idx] = updated;
		// this.data = newList;
		// return updated;
		if (!auth.token) throw new Error('Not authenticated');
		const { data, error } = await client.PUT('/tags/{tag_id}', {
			body: updated,
			headers: auth.headers,
			params: {
				path: {
					tag_id: updated.id
				}
			}
		});
		if (error) {
			throw error;
		}
		if (!data.success) {
			throw new Error('Failed to update tag');
		}
		const updatedTag = data.tag;
		if (!updatedTag || !updatedTag.id) {
			throw new Error('Failed to update tag: Invalid response' + JSON.stringify(data));
		}
		this.data = this.data?.map((tag) => (tag.id === updatedTag.id ? updatedTag : tag)) || [];
		return updatedTag;
	}

	/** Delete a tag by its ID */
	async delete(id: string): Promise<void> {
		// if (!this.data) return false;
		// const before = this.data.length;
		// this.data = this.data.filter((tag) => tag.id !== id);
		// return this.data.length < before;
		if (!auth.token) throw new Error('Not authenticated');
		const { data, error } = await client.DELETE(`/tags/{tag_id}`, {
			headers: auth.headers,
			params: {
				path: {
					tag_id: id
				}
			}
		});
		if (error) {
			throw error;
		}
		if (!data) {
			throw new Error('Failed to delete tag: Invalid response: ' + JSON.stringify(data));
		}
		if (!data.success) {
			throw new Error('Failed to delete tag');
		}
		this.data = this.data?.filter((tag) => tag.id !== id) || [];
	}

	async applyToAd(ad: BasicAdData, tagIds: string[]): Promise<void> {
		if (!auth.token) throw new Error('Not authenticated');
		const { data, error } = await client.PUT('/ads/{observer_id}/{timestamp}.{ad_id}/tags', {
			headers: auth.headers,
			params: {
				path: {
					observer_id: ad.observer,
					timestamp: ad.timestamp.toString(),
					ad_id: ad.adId
				}
			},
			body: {
				tag_ids: [...tagIds]
			}
		});
		if (error) {
			throw error;
		}
		if (!data.success) {
			throw new Error('Failed to apply tags to ad');
		}
		// Update the ad's tags in the local state
		await session.ads.enrich(ad, ['tags'], {
			preferCache: false,
			inPlace: true
		});
	}
}
