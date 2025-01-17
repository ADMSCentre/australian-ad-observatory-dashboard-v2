import { parseAdsIndex } from './session/ads/utils';
import { client, runWithCache, generateCacheKey } from '$lib/api/client';
import type { IndexGroupType, RichAdData, ObservationIndex } from './session/ads/types';

const parseAdPath = (path: string) => {
	const parts = path.split('/');
	const observer = parts[0];
	const timestampAndId = parts[2];
	const [adId, timestamp] = timestampAndId.split('.').reverse();
	return { observer, timestamp, adId, path };
};

export const listAllAds = async (
	token: string,
	filters: ((ad: RichAdData) => boolean)[] = [],
	types: IndexGroupType[] = ['ads_passed_restitch']
) => {
	const url = '/ads';
	const options = {
		headers: { Authorization: `Bearer ${token}` }
	};

	const presignedUrl = await runWithCache<string>({
		cacheKey: generateCacheKey(url, options),
		run: async () => {
			const { data, error } = await client.GET(url, options);
			if (!data?.success || !data?.presigned_url || error) {
				return '';
			}
			return data.presigned_url;
		},
		cache: async (data) => {
			const urlParams = new URLSearchParams(data);
			const expireAt = urlParams.get('Expires') || -1;
			const expireAtMs = expireAt !== -1 && +expireAt * 1000;
			return { data, expireAt: +expireAtMs };
		}
	});
	const presignedRes = await fetch(presignedUrl);

	// value structure: fda7681c-d7f1-4420-8499-46b4695d224a/temp/1729261457039.c979d19c-0546-412b-a2d9-63a247d7c250/
	const raw = await presignedRes.json();

	const observationTypes = Object.keys(raw);
	const index: ObservationIndex = observationTypes.reduce((acc, category) => {
		if (!acc) acc = {};
		acc[category] = raw[category].map((path: string) => parseAdPath(path));
		return acc;
	}, {} as ObservationIndex);

	const ads = parseAdsIndex(index, types) as RichAdData[];
	return ads.filter((ad) => filters.every((filter) => filter(ad)));
};

export interface QuickAccessCacheResponse {
	success: boolean;
	data: ObservationIndex;
}

export const listAdsForObserver = async (
	token: string,
	observer: string,
	filters: ((ad: RichAdData) => boolean)[] = [],
	types: IndexGroupType[] = ['ads_passed_restitch']
) => {
	const { data, error } = await client.GET('/ads/{observer_id}', {
		headers: {
			Authorization: `Bearer ${token}`
		},
		params: {
			path: {
				observer_id: observer
			}
		}
	});
	if (!data?.success || !data.data || error) {
		return [];
	}
	const raw: {
		[key: string]: string[];
	} = data.data;
	const observationTypes = Object.keys(raw);
	const index: ObservationIndex = observationTypes.reduce((acc, category) => {
		if (!acc) acc = {};
		acc[category] = raw[category].map((path: string) => parseAdPath(path));
		return acc;
	}, {} as ObservationIndex);
	const ads = parseAdsIndex(index, types) as RichAdData[];
	return ads.filter((ad) => filters.every((filter) => filter(ad)));
};

export const getAdFrameUrls = async (
	token: string,
	adData: {
		observer: string;
		timestamp: number;
		adId: string;
	}
) => {
	const url = '/ads/{observer_id}/{timestamp}.{ad_id}/frames';
	const options = {
		headers: {
			Authorization: `Bearer ${token}`
		},
		params: {
			path: {
				observer_id: adData.observer,
				timestamp: adData.timestamp.toString(),
				ad_id: adData.adId
			}
		}
	};

	return await runWithCache<string[]>({
		cacheKey: generateCacheKey(url, options),
		run: async () => {
			const { data, error } = await client.GET(url, options);
			if (!data?.success || !data.presigned_urls || error) {
				return [];
			}
			return data.presigned_urls;
		},
		cache: async (data) => {
			const urlParams = new URLSearchParams(data[0]);
			const expireAt = urlParams.get('Expires') || -1;
			const expireAtMs = expireAt !== -1 && +expireAt * 1000;
			return { data, expireAt: +expireAtMs };
		}
	});
};
