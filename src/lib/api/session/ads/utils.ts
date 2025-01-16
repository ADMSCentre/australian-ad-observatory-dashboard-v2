import { CalendarDate } from '@internationalized/date';
import { client, generateCacheKey, runWithCache } from '$lib/api/client';
import rdo from '../../../../routes/mobile-observations/rdo.json';
import type { RichDataObject } from './rich-data-object-type';
import type {
	IndexGroupType,
	ExpandType,
	BasicAdData,
	RichAdData,
	ObservationIndex
} from './types';

export const dateToCalendarDate = (date: Date) => {
	return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
};

export const formatTimestamp = (
	timestamp: string | number,
	options?: Intl.DateTimeFormatOptions
) => {
	// const date = new Date(parseInt(timestamp));
	const date = new Date(+timestamp);
	const opts = {
		year: '2-digit' as const,
		month: 'numeric' as const,
		day: 'numeric' as const,
		weekday: 'long' as const,
		...options
	};
	return new Intl.DateTimeFormat('en-GB', opts).format(date);
};

export const parseAdsIndex = (
	index: ObservationIndex,
	type: IndexGroupType = 'ads_passed_restitch'
) => {
	const adsIndex = index[type]
		.map((ad) => {
			// Convert timestamp to date (DD/MM/YYYY) and time (HH:MM:SS.SSS)
			const date = new Date(+ad.timestamp).toLocaleDateString('en-GB', {
				month: 'long',
				day: 'numeric',
				year: 'numeric'
			});
			const time = new Date(+ad.timestamp).toLocaleTimeString('en-GB', {
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				fractionalSecondDigits: 3
			});
			return {
				...ad,
				timestamp: +ad.timestamp,
				date,
				time
			};
		})
		.toSorted((a, b) => b.timestamp - a.timestamp);
	return adsIndex;
};

export const enrichAllAds = async (
	ads: BasicAdData[],
	token: string,
	expand: ExpandType[] = []
) => {
	const enrichedAds = await Promise.all(ads.map((ad) => enrichSingleAd(ad, token, expand)));
	return enrichedAds;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const enrichSingleAd = async (ad: BasicAdData, token: string, expand: ExpandType[] = []) => {
	const richAd = { ...ad } as RichAdData;
	// const enrichers = expand.map((type) => {
	// 	switch (type) {
	// 		case 'attributes':
	// 			return async () => {
	// 				richAd.attributes = await fetchAttributes(ad, token);
	// 			};
	// 		case 'richDataObject':
	// 			return async () => {
	// 				richAd.richDataObject = await fetchRichDataObject(ad, token);
	// 			};
	// 	}
	// });
	// await Promise.all(enrichers.map((enricher) => enricher()));
	return richAd;
};

export const fetchAttributes = async (adData: BasicAdData, token: string) => {
	const { data, error } = await client.GET('/ads/{observer_id}/{timestamp}.{ad_id}/attributes', {
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
	});
	if (error) {
		console.error(error);
		return {};
	}
	return data.attributes || {};
};

// TODO: Replace with actual API call
export const fetchRichDataObject = async (
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	adData: BasicAdData,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	token: string
): Promise<RichDataObject> => {
	return new Promise((resolve) => {
		setTimeout(() => {
			// ! This isn't safe - need proper type checking later
			return resolve(rdo as unknown as RichDataObject);
		}, 100);
	});
};

export const fetchStitchFrames = async (
	adData: {
		observer: string;
		timestamp: number;
		adId: string;
	},
	token: string
): Promise<string[]> => {
	const url = '/ads/{observer_id}/{timestamp}.{ad_id}/stitching/frames';
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

export const fetchMedia = async (path: string, token: string) => {
	const url = `/medias`;
	const options = {
		headers: {
			Authorization: `Bearer ${token}`
		},
		params: {
			query: {
				path: path
			}
		}
	};

	return await runWithCache<string>({
		cacheKey: generateCacheKey(url, options),
		run: async () => {
			const { data, error } = await client.GET(url, options);
			if (!data?.success || !data.presigned_url || error) {
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
};
