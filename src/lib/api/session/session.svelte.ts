// This is used to manage interactions with the API, and automatically handle authorisation
import { auth } from '$lib/api/auth/auth.svelte';
import type { Query } from '../../../routes/mobile-observations/query/query';
import { client } from '../client';
import { listAdsForObserver, listAllAds } from '../mobile-observations';
import { RichDataBuilder } from './ads/enricher';
import type { ExpandType, IndexGroupType, RichAdData } from './ads/types';
import { fetchAttributes, fetchRichDataObject, fetchStitchFrames } from './ads/utils';
import { ProjectApiAdapter as ProjectsApi } from './projects/index.svelte';
import { UsersApi } from './users/index.svelte';

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
		// 'ads_passed_mass_download',
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

			// Loop through the expanded ads and cache the attributes
			for (const ad of data.expand ?? []) {
				const adId = ad.ad_id;
				if (ad.attributes) {
					this.enrichedAds[adId] = this.enrichedAds[adId] ?? {
						...ad
					};
					this.enrichedAds[adId].attributes = ad.attributes;
				}
			}
			return data;
		},
		enrich: async (
			ad: RichAdData,
			expands: ExpandType[] = [],
			{
				preferCache = true,
				inPlace = true
			}: Partial<{
				preferCache?: boolean;
				inPlace?: boolean;
			}> = {}
		) => {
			if (!auth.token) return;
			const getCache = (type: ExpandType) => {
				if (!preferCache) return null;
				console.log('Getting cache for', type, ad.adId, this.enrichedAds?.[ad.adId]?.[type]);
				return this.enrichedAds?.[ad.adId]?.[type];
			};
			const updateCache = (type: ExpandType, data: unknown) => {
				if (!preferCache) return;
				if (!this.enrichedAds[ad.adId])
					this.enrichedAds[ad.adId] = {
						...ad
					};
				this.enrichedAds[ad.adId][type] = data;
			};
			const enricher = new RichDataBuilder(auth.token, ad);
			const enrichedData: RichAdData = {
				...ad
			};
			await Promise.all(
				expands.map(async (expand) => {
					switch (expand) {
						case 'stitchedFrames':
							if (auth.token) {
								const res = getCache(expand) ?? (await fetchStitchFrames(ad, auth.token));
								updateCache(expand, res);
								if (!inPlace) {
									enrichedData.stitchedFrames = res;
									break;
								}
								ad.stitchedFrames = res;
							}
							break;
						case 'attributes':
							if (auth.token) {
								const res = getCache(expand) ?? (await fetchAttributes(ad, auth.token));
								updateCache(expand, res);
								if (!inPlace) {
									enrichedData.attributes = res;
									break;
								}
								ad.attributes = res;
							}
							break;
						case 'richDataObject':
							if (auth.token) {
								const res = getCache(expand) ?? (await fetchRichDataObject(ad, auth.token));
								updateCache(expand, res);
								if (!inPlace) {
									enrichedData.richDataObject = res;
									break;
								}
								ad.richDataObject = res;
							}
							break;
						case 'metaLibraryScrape':
							{
								const res = getCache(expand) ?? (await enricher.getCandidates());
								updateCache(expand, res);
								if (!inPlace) {
									enrichedData.metaLibraryScrape = res;
									break;
								}
								ad.metaLibraryScrape = res;
							}
							break;
					}
				})
			);
			if (!inPlace) return enrichedData;
		}
	});

	projects = new ProjectsApi();
	users = new UsersApi();
}

export const session = new Session();
session.projects.fetch();
session.users.fetch();
