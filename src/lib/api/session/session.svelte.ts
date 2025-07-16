// This is used to manage interactions with the API, and automatically handle authorisation
import { auth } from '$lib/api/auth/auth.svelte';
import { MaintenancesRepository } from '$lib/mocks/maintenances.svelte';
import { client, runWithCache } from '../client';
import { listAdsForObserver, listAllAds } from '../mobile-observations';
import { RichDataBuilder } from './ads/enricher';
import type { RichDataObject } from './ads/rich-data-object-type';
import type { ExpandType, IndexGroupType, RichAdData } from './ads/types';
import { fetchAttributes, fetchTags, fetchRichDataObject, fetchStitchFrames } from './ads/utils';
import { ObserversApiAdapter } from './observers/index.svelte';
import { ProjectApiAdapter as ProjectsApi } from './projects/index.svelte';
import { QueryApiAdapter } from './query/index.svelte';
import { TagApiAdapter } from './tags/index.svelte';
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

	getCache = (ad: RichAdData, type: ExpandType, preferCache: boolean = false) => {
		if (!preferCache) return null;
		return this.enrichedAds?.[ad.adId]?.[type];
	};
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	updateCache = (ad: RichAdData, type: ExpandType, data: any) => {
		if (!this.enrichedAds[ad.adId])
			this.enrichedAds[ad.adId] = {
				...ad
			};
		this.enrichedAds[ad.adId][type] = data;
	};

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
		getByObserver: async (observer: string) => {
			if (!auth.token) return [];
			return await listAdsForObserver(auth.token, observer);
		},
		getEnrichedData: async (
			ads: RichAdData[],
			expands: ExpandType[] = [],
			{
				updateMemoryCache = true
			}: {
				updateMemoryCache?: boolean;
			} = {}
		) => {
			if (!auth.token) return;
			const { data, error } = await client.POST('/ads/batch/presign', {
				headers: this.authHeader,
				body: {
					ads: ads.map((ad) => ({
						ad_id: ad.adId,
						observer_id: ad.observer,
						timestamp: ad.timestamp.toString()
					})),
					metadata_types: [
						...expands
							.map((e) => {
								switch (e) {
									case 'attributes':
										return 'attributes';
									case 'tags':
										return 'tags';
									case 'richDataObject':
										return 'rdo';
									default:
										return null;
								}
							})
							.filter((e) => e !== null)
					]
				}
			});
			if (error) throw error;
			if (!data) return [];

			const presignedUrl = data.presigned_url;
			if (!presignedUrl) throw new Error('No presigned URL found in response');
			// Fetch the presigned URL and get the data
			// const presignedData = await fetch(presignedUrl);
			const presignedData = await runWithCache({
				cacheKey: presignedUrl,
				run: async () => {
					const res = await fetch(presignedUrl);
					return res.json();
				},
				cache: async (data) => {
					const urlParams = new URLSearchParams(presignedUrl);
					const expireAt = urlParams.get('Expires') || -1;
					const expireAtMs = expireAt !== -1 && +expireAt * 1000;
					return { data, expireAt: +expireAtMs };
				}
			});

			const results = presignedData as {
				ad_id: string;
				metadata: Record<string, never>;
			}[];

			const adsLookupTable = ads.reduce(
				(acc, ad) => {
					acc[ad.adId] = ad;
					return acc;
				},
				{} as Record<string, RichAdData>
			);

			const enrichedAds: RichAdData[] =
				results?.map((ad) => {
					const originalAd = adsLookupTable[ad.ad_id];
					if (!originalAd) throw new Error('Ad not found in original ads');
					const { rdo, ...rest } = ad.metadata as {
						rdo?: RichDataObject;
						[key: string]: unknown;
					};
					return {
						...originalAd,
						// We need to convert .rdo to .richDataObject to fit the field name in RichAdData
						richDataObject: rdo,
						// Other metadata fields are already in the correct format
						...rest
					} satisfies RichAdData;
				}) ?? [];
			if (!updateMemoryCache) return enrichedAds;

			// Loop through the expanded ads and cache the attributes
			enrichedAds.forEach((enrichedAd) => {
				const adId = enrichedAd.adId;
				if (!this.enrichedAds[adId]) this.enrichedAds[adId] = { ...enrichedAd };
				this.enrichedAds[adId] = {
					...this.enrichedAds[adId],
					...enrichedAd
				};
			});
			return enrichedAds;
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
			const enricher = new RichDataBuilder(auth.token, ad);
			const enrichedData: RichAdData = {
				...ad
			};
			const promises: Promise<void>[] = expands.map(async (expand) => {
				switch (expand) {
					case 'stitchedFrames':
						if (auth.token) {
							const res =
								this.getCache(ad, expand, preferCache) ?? (await fetchStitchFrames(ad, auth.token));
							// Throw error if incompatible types
							if (!Array.isArray(res)) throw new Error('Incompatible types for stitchedFrames');
							this.updateCache(ad, expand, res);
							if (!inPlace) {
								enrichedData.stitchedFrames = res;
								break;
							}
							ad.stitchedFrames = res;
						}
						break;
					case 'tags':
						if (auth.token) {
							const res =
								this.getCache(ad, expand, preferCache) ?? (await fetchTags(ad, auth.token));
							this.updateCache(ad, expand, res);
							if (!inPlace) {
								enrichedData.tags = res;
								break;
							}
							ad.tags = res;
						}
						break;
					case 'attributes':
						if (auth.token) {
							const res =
								this.getCache(ad, expand, preferCache) ?? (await fetchAttributes(ad, auth.token));
							this.updateCache(ad, expand, res);
							if (!inPlace) {
								enrichedData.attributes = res;
								break;
							}
							ad.attributes = res;
						}
						break;
					case 'richDataObject':
						if (auth.token) {
							const res =
								this.getCache(ad, expand, preferCache) ??
								(await fetchRichDataObject(ad, auth.token));
							this.updateCache(ad, expand, res);
							if (!inPlace) {
								enrichedData.richDataObject = res;
								break;
							}
							ad.richDataObject = res;
						}
						break;
					case 'metaLibraryScrape':
						{
							const res =
								this.getCache(ad, expand, preferCache) ?? (await enricher.getCandidates());
							this.updateCache(ad, expand, res);
							if (!inPlace) {
								enrichedData.metaLibraryScrape = res;
								break;
							}
							ad.metaLibraryScrape = res;
						}
						break;
				}
			});
			// for (const promise of promises) {
			// 	await promise;
			// }
			await Promise.all(promises);
			if (!inPlace) return enrichedData;
		}
	});

	projects = new ProjectsApi();
	users = new UsersApi();
	tags = new TagApiAdapter();
	query = new QueryApiAdapter();

	observers = new ObserversApiAdapter();

	maintenances = new MaintenancesRepository();

	async refresh() {
		console.log('Refreshing session data');
		this.users.fetch();
		this.observers.fetch();
		this.maintenances.fetch();
	}
}

export const session = new Session();
session.refresh();
