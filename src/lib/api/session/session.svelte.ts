// This is used to manage interactions with the API, and automatically handle authorisation
import { auth } from '$lib/api/auth/auth.svelte';
import type { Query } from '../../../routes/mobile-observations/query/const';
import { client } from '../client';
import { getAdFrameUrls, listAdsForObserver, listAllAds } from '../mobile-observations';
import { RichDataBuilder } from './ads/enricher';
import type { ExpandType, IndexGroupType, RichAdData } from './ads/types';
import { fetchAttributes, fetchRichDataObject, fetchStitchFrames } from './ads/utils';

export const INDEX_GROUP_TYPES: {
	value: IndexGroupType;
	label: string;
	description: string;
}[] = [
	{
		value: 'ads_passed_restitch',
		label: 'Cropped',
		description: "Ads that have been cropped for to only show the ad's content"
	},
	{
		value: 'ads_passed_mass_download',
		label: 'Matched',
		description: 'Ads that have been matched to a known ad in the Meta Ads Library'
	},
	{
		value: 'ads_passed_rdo_construction',
		label: 'RDO',
		description: 'Ads that have been processed to create a Rich Data Object'
	}
];

export class Session {
	indexGroupTypes = $state<IndexGroupType[]>([
		'ads_passed_mass_download',
		'ads_passed_rdo_construction'
	]);
	authHeader = $derived.by(() => {
		return { Authorization: `Bearer ${auth.token}` };
	});
	allAds = $state<Record<string, RichAdData>>({});
	enrichedAds = $state<Record<string, RichAdData>>({});

	ads = $derived({
		getAll: async ({
			filters = [],
			types = null
		}: Partial<{
			filters: ((ad: RichAdData) => boolean)[];
			types: IndexGroupType[] | null;
		}> = {}) => {
			if (!auth.token) return [];
			return await listAllAds(auth.token, filters, types ?? this.indexGroupTypes);
		},
		getByObserver: async (
			observer: string,
			{
				filters = [],
				types = null
			}: Partial<{
				filters?: ((ad: RichAdData) => boolean)[];
				types: IndexGroupType[] | null;
			}> = {}
		) => {
			if (!auth.token) return [];
			return await listAdsForObserver(auth.token, observer, filters, types ?? this.indexGroupTypes);
		},
		query: async (query: Query) => {
			const { data, error } = await client.POST('/ads/query', {
				headers: this.authHeader,
				body: query as Record<string, unknown>
			});
			if (error) throw error;
			return data;
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
			if (!auth.token) return;
			const getCache = (type: ExpandType) => {
				if (!preferCache) return null;
				return this.enrichedAds?.[ad.adId]?.[type];
			};
			const enricher = new RichDataBuilder(auth.token, ad);
			await Promise.all(
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
						case 'ocrData':
							ad.ocrData = getCache(expand) ?? (await enricher.getOcrData());
							break;
						case 'dimensions':
							ad.dimensions = getCache(expand) ?? (await enricher.getDimensions());
							break;
						case 'metaLibraryScrape':
							ad.metaLibraryScrape = getCache(expand) ?? (await enricher.getCandidates());
							break;
					}
				})
			);
		}
	});
}

export const session = new Session();
