import type { ObservationIndex } from '$lib/api/mobile-observations';
import { CalendarDate } from '@internationalized/date';

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
	const adsIndex = index['ads']
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
