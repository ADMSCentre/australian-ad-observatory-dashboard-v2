import { parseAdsIndex } from '../../routes/mobile-observations/utils';

export const MOBILE_OBSERVATIONS_API_URL =
	'https://f06kj1k332.execute-api.ap-southeast-2.amazonaws.com/dev/';

export const fetchMobileObservationsApi = async (
	endpoint: string,
	{
		method = 'GET',
		token = '',
		headers = {},
		body = {}
	}: {
		method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';
		token?: string;
		headers?: Record<string, string>;
		body?: unknown;
	}
) => {
	const url = `${MOBILE_OBSERVATIONS_API_URL}${endpoint}`;
	const res = await fetch(url, {
		method,
		headers: {
			Authorization: `Bearer ${token}`,
			...headers
		},
		mode: 'cors',
		...(method !== 'GET' && method !== 'HEAD' ? { body: JSON.stringify(body) } : {})
	});
	return await res.json();
};

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

export const listAllAds = async (token: string) => {
	const responseJson = await fetchMobileObservationsApi('list-ads', {
		token,
		method: 'GET'
	});
	const presignedUrl = responseJson.presigned_url;
	// Get the data from the presigned URL
	const presignedRes = await fetch(presignedUrl);
	// value structure: fda7681c-d7f1-4420-8499-46b4695d224a/temp/1729261457039.c979d19c-0546-412b-a2d9-63a247d7c250/
	// observer: fda7681c-d7f1-4420-8499-46b4695d224a
	// timestamp: 1729261457039
	// ad_id: c979d19c-0546-412b-a2d9-63a247d7c250
	const raw = await presignedRes.json();

	const observationTypes = Object.keys(raw);
	const data: ObservationIndex = observationTypes.reduce((acc, category) => {
		if (!acc) acc = {};
		acc[category] = raw[category].map((path: string) => parseAdPath(path));
		return acc;
	}, {} as ObservationIndex);
	// return data;
	return parseAdsIndex(data);
};

export interface QuickAccessCacheResponse {
	success: boolean;
	data: ObservationIndex;
}

export const listAdsForObserver = async (token: string, observer: string) => {
	const responseJson: {
		success: boolean;
		data: {
			[key: string]: string[];
		};
	} = await fetchMobileObservationsApi(`get-access-cache?observer_id=${observer}`, {
		token,
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});
	const raw: {
		[key: string]: string[];
	} = responseJson.data;
	const observationTypes = Object.keys(raw);
	const data: ObservationIndex = observationTypes.reduce((acc, category) => {
		if (!acc) acc = {};
		acc[category] = raw[category].map((path: string) => parseAdPath(path));
		return acc;
	}, {} as ObservationIndex);
	return parseAdsIndex(data);
};

export const getAdFrameUrls = async (token: string, framePath: string) => {
	const presignedRes: {
		success: boolean;
		presigned_urls: string[];
	} = await fetchMobileObservationsApi(`get-frames-presigned?path=${framePath}`, {
		token,
		method: 'GET'
	});
	const presignedUrls = presignedRes.presigned_urls;
	return presignedUrls;
};
