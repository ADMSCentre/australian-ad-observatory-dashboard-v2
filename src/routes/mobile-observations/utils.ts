import type { ObservationIndex } from '$lib/api/mobile-observations';
import { CalendarDate } from '@internationalized/date';
import type { BasicAdData, RichAdData } from './types';
import { client } from '$lib/api/client';
import rdo from './rdo.json';
import type { RichDataObject } from './rich-data-object-type';

export const dateToCalendarDate = (date: Date) => {
	return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
};

export const parseTime = (timestamp: string | number) => {
	// const date = new Date(parseInt(timestamp));
	const date = new Date(+timestamp);
	const options = {
		year: '2-digit' as const,
		month: 'numeric' as const,
		day: 'numeric' as const,
		weekday: 'long' as const
	};
	return new Intl.DateTimeFormat('en-GB', options).format(date);
};

export const parseAdsIndex = (index: ObservationIndex) => {
	const adsIndex = index['ads_passed_mass_download']
		.map((ad) => {
			// Convert timestamp to date (DD/MM/YYYY) and time (HH:MM:SS.SSS)
			const date = new Date(+ad.timestamp).toLocaleDateString('en-US', {
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

export type ExpandType = 'attributes' | 'richDataObject';

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
		return;
	}
	return data.attributes;
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
