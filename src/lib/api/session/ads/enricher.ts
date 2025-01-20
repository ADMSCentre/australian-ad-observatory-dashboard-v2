import { client } from '$lib/api/client';
import type { BasicAdData } from './types';

export class RichDataBuilder {
	token: string;
	ad: BasicAdData;
	authHeader: Record<string, string>;

	constructor(token: string, ad: BasicAdData) {
		this.token = token;
		this.ad = ad;
		this.authHeader = { Authorization: `Bearer ${this.token}` };
	}

	async getOcrData() {
		const { data, error } = await client.GET(
			'/ads/{observer_id}/{timestamp}.{ad_id}/rdo/ocr_data',
			{
				headers: {
					...this.authHeader
				},
				params: {
					path: {
						observer_id: this.ad.observer,
						timestamp: this.ad.timestamp.toString(),
						ad_id: this.ad.adId
					}
				}
			}
		);
		if (error) {
			console.error(error);
			return {};
		}
		return data.ocr_data || {};
	}

	async getDimensions() {
		const { data, error } = await client.GET(
			'/ads/{observer_id}/{timestamp}.{ad_id}/rdo/dimensions',
			{
				headers: {
					...this.authHeader
				},
				params: {
					path: {
						observer_id: this.ad.observer,
						timestamp: this.ad.timestamp.toString(),
						ad_id: this.ad.adId
					}
				}
			}
		);
		if (error) {
			console.error(error);
			return {};
		}
		return data.dimensions || {};
	}

	async getCandidates() {
		const { data, error } = await client.GET(
			'/ads/{observer_id}/{timestamp}.{ad_id}/rdo/candidates',
			{
				headers: {
					...this.authHeader
				},
				params: {
					path: {
						observer_id: this.ad.observer,
						timestamp: this.ad.timestamp.toString(),
						ad_id: this.ad.adId
					}
				}
			}
		);
		if (error) {
			console.error(error);
			return {};
		}
		return {
			candidates: data.candidates || [],
			mediaPaths: data.media_paths || {},
			rankings: data.rankings || []
		};
	}
}
