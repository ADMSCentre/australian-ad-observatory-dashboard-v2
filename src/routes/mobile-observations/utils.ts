import type { ObservationIndex } from '$lib/api/mobile-observations';
import { CalendarDate } from '@internationalized/date';
import type { BasicAdData, RichAdData } from './observer/types';
import { client } from '$lib/api/client';

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

export type ExpandType = 'attributes';

export const enrichAllAds = async (
	ads: BasicAdData[],
	token: string,
	expand: ExpandType[] = []
) => {
	const enrichedAds = await Promise.all(ads.map((ad) => enrichSingleAd(ad, token, expand)));
	return enrichedAds;
};

export const enrichSingleAd = async (ad: BasicAdData, token: string, expand: ExpandType[] = []) => {
	const richAd = { ...ad } as RichAdData;
	if (expand.includes('attributes')) {
		richAd.attributes = await fetchAttributes(ad, token);
	}
	return richAd;
};

const fetchAttributes = async (adData: BasicAdData, token: string) => {
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
