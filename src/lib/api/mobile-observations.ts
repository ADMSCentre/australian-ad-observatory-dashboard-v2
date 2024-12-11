import {
	enrichAllAds,
	parseAdsIndex,
	type ExpandType
} from '../../routes/mobile-observations/utils';
import { client, setCache, tryGetFromCache } from '$lib/api/client';
import type { BasicAdData, RichAdData } from '../../routes/mobile-observations/observer/types';

// export const fetchMobileObservationsApi = async (
// 	endpoint: string,
// 	{
// 		method = 'GET',
// 		token = '',
// 		headers = {},
// 		body = {}
// 	}: {
// 		method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';
// 		token?: string;
// 		headers?: Record<string, string>;
// 		body?: unknown;
// 	}
// ) => {
// 	const { data } = await client.GET('/ads', {
// 		headers: {
// 			Authorization: `Bearer ${token}`,
// 			...headers
// 		},
// 		requestBody: body
// 	});

// 	// const res = await fetch(url, {
// 	// 	method,
// 	// 	headers: {
// 	// 		Authorization: `Bearer ${token}`,
// 	// 		...headers
// 	// 	},
// 	// 	mode: 'cors',
// 	// 	...(method !== 'GET' && method !== 'HEAD' ? { body: JSON.stringify(body) } : {})
// 	// });
// 	// return await res.json();
// 	return data;
// };

export type ObservationIndex = {
	[key: string]: { observer: string; timestamp: string; adId: string; path: string }[];
};

const parseAdPath = (path: string) => {
	const parts = path.split('/');
	const observer = parts[0];
	const timestampAndId = parts[2];
	const [adId, timestamp] = timestampAndId.split('.').reverse();
	return { observer, timestamp, adId, path };
};

export const listAllAds = async (
	token: string,
	expand: ExpandType[] = [],
	filters: ((ad: RichAdData) => boolean)[] = []
) => {
	const { data, error } = await client.GET('/ads', {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	if (!data?.success || !data?.presigned_url || error) {
		return [];
	}
	const { presigned_url: presignedUrl } = data;
	// Get the data from the presigned URL
	const presignedRes = await fetch(presignedUrl);
	// value structure: fda7681c-d7f1-4420-8499-46b4695d224a/temp/1729261457039.c979d19c-0546-412b-a2d9-63a247d7c250/
	// observer: fda7681c-d7f1-4420-8499-46b4695d224a
	// timestamp: 1729261457039
	// ad_id: c979d19c-0546-412b-a2d9-63a247d7c250
	const raw = await presignedRes.json();

	const observationTypes = Object.keys(raw);
	const index: ObservationIndex = observationTypes.reduce((acc, category) => {
		if (!acc) acc = {};
		acc[category] = raw[category].map((path: string) => parseAdPath(path));
		return acc;
	}, {} as ObservationIndex);

	let ads = parseAdsIndex(index) as RichAdData[];
	if (expand.length > 0) {
		ads = await enrichAllAds(ads, token, expand);
	}
	return ads.filter((ad) => filters.every((filter) => filter(ad)));
};

export interface QuickAccessCacheResponse {
	success: boolean;
	data: ObservationIndex;
}

export const listAdsForObserver = async (
	token: string,
	observer: string,
	expand: ExpandType[] = [],
	filters: ((ad: RichAdData) => boolean)[] = []
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
	let ads = parseAdsIndex(index) as RichAdData[];
	if (expand.length > 0) {
		ads = await enrichAllAds(ads, token, expand);
	}
	return ads.filter((ad) => filters.every((filter) => filter(ad)));
};

export const getAdFrameUrls = async (token: string, adData: BasicAdData) => {
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
	const cached = await tryGetFromCache(url, options);
	if (cached) return cached;

	// If not cached, fetch the data
	const { data, error } = await client.GET(url, options);
	if (!data?.success || !data.presigned_urls || error) {
		return [];
	}
	const presignedUrls = data.presigned_urls;

	// Get the expiration from the first URL
	const urlParams = new URLSearchParams(presignedUrls[0]);
	const expireAt = urlParams.get('Expires') || -1;
	// Ensure the expiration is in milliseconds
	const expireAtMs = expireAt !== -1 && +expireAt * 1000;

	// Cache the data
	await setCache(url, options, presignedUrls, +expireAtMs);
	return presignedUrls;
};
