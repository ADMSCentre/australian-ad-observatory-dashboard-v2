import { CalendarDate } from '@internationalized/date';
import { client, generateCacheKey, runWithCache } from '$lib/api/client';
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

const DEFAULT_DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', {
	year: '2-digit',
	month: 'numeric',
	day: 'numeric',
	weekday: 'long'
});

export const formatTimestamp = (
	timestamp: string | number,
	options?: Intl.DateTimeFormatOptions
) => {
	const date = new Date(+timestamp);

	// If options are not provided, use the default formatter for performance
	if (!options) {
		return DEFAULT_DATE_FORMATTER.format(date);
	}

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
	types: IndexGroupType[] = ['ads_passed_restitch']
) => {
	const adsDict = {} as Record<string, BasicAdData>;

	// Instead of calling the date.toLocaleDateString and time.toLocaleTimeString multiple times,
	// we can create formatters to reuse them for a massive performance improvement.
	//
	// src: https://nedwize.hashnode.dev/tolocalestring-is-too-slow-heres-how-to-improve-it
	const dateFormatter = new Intl.DateTimeFormat('en-GB', {
		month: 'long',
		day: 'numeric',
		year: 'numeric'
	});
	const timeFormatter = new Intl.DateTimeFormat('en-GB', {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		fractionalSecondDigits: 3
	});

	types.forEach((type) => {
		const ads = index[type];
		if (!ads) return;
		ads.forEach((ad) => {
			const { observer, timestamp, adId, path } = ad;
			const types = [type];
			const timestampDate = new Date(+timestamp);
			const date = dateFormatter.format(timestampDate);
			const time = timeFormatter.format(timestampDate);
			if (adsDict[adId]) {
				adsDict[adId].types.push(type);
				return;
			}
			adsDict[adId] = { observer, timestamp: +timestamp, adId, path, types, date, time };
		});
	});

	const adsIndex = Object.values(adsDict).toSorted((a, b) => b.timestamp - a.timestamp);
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

export const fetchTags = async (adData: BasicAdData, token: string): Promise<string[]> => {
	const { data, error } = await client.GET('/ads/{observer_id}/{timestamp}.{ad_id}/tags', {
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
		return [];
	}
	return data.tag_ids || [];
};

export const fetchRichDataObject = async (
	adData: BasicAdData,
	token: string
): Promise<RichDataObject | undefined> => {
	const options = {
		headers: {
			Authorization: `Bearer ${token}`
		}
	};

	const { data, error } = await client.GET('/ads/{observer_id}/{timestamp}.{ad_id}/rdo', {
		...options,
		params: {
			path: {
				timestamp: adData.timestamp.toString(),
				observer_id: adData.observer,
				ad_id: adData.adId
			}
		}
	});
	if (error) {
		console.error(error);
		return;
	}
	return data.data as unknown as RichDataObject;
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
