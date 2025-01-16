// This is used to manage interactions with the API, and automatically handle authorisation
import { auth } from '$lib/api/auth/auth.svelte';
import { getAdFrameUrls, listAdsForObserver, listAllAds } from '../mobile-observations';
import type { ExpandType, IndexGroupType, RichAdData } from './ads/types';
import { fetchAttributes, fetchRichDataObject, fetchStitchFrames } from './ads/utils';

export class Session {
	indexGroupType = $state<IndexGroupType>('ads_passed_restitch');
	authHeader = $derived.by(() => {
		return { Authorization: `Bearer ${auth.token}` };
	});
	enrichedAds = $state<Record<string, RichAdData>>({});

	ads = $derived({
		getAll: async ({
			filters = [],
			type = null
		}: Partial<{
			filters: ((ad: RichAdData) => boolean)[];
			type: IndexGroupType | null;
		}> = {}) => {
			if (!auth.token) return [];
			return await listAllAds(auth.token, filters, type ?? this.indexGroupType);
		},
		getByObserver: async (
			observer: string,
			{
				filters = [],
				expands = [],
				type = null
			}: Partial<{
				filters?: ((ad: RichAdData) => boolean)[];
				expands?: ExpandType[];
				type: IndexGroupType | null;
			}> = {}
		) => {
			if (!auth.token) return [];
			return await listAdsForObserver(
				auth.token,
				observer,
				expands,
				filters,
				type ?? this.indexGroupType
			);
		},
		enrich: async (
			ad: RichAdData,
			expands: ExpandType[] = [],
			{
				preferCache = true
			}: Partial<{
				preferCache?: boolean;
			}> = {}
		) => {
			const getCache = (type: ExpandType) => {
				if (!preferCache) return null;
				return this.enrichedAds?.[ad.adId]?.[type];
			};
			Promise.all(
				expands.map(async (expand) => {
					switch (expand) {
						case 'rawFrames':
							if (auth.token)
								ad.rawFrames = getCache(expand) ?? (await getAdFrameUrls(auth.token, ad));
							break;
						case 'stitchedFrames':
							if (auth.token)
								ad.stitchedFrames = getCache(expand) ?? (await fetchStitchFrames(ad, auth.token));
							break;
						case 'attributes':
							if (auth.token)
								ad.attributes = getCache(expand) ?? (await fetchAttributes(ad, auth.token));
							break;
						case 'richDataObject':
							if (auth.token)
								ad.richDataObject = getCache(expand) ?? (await fetchRichDataObject(ad, auth.token));
							break;
					}
				})
			);
		}
	});
}

export const session = new Session();
