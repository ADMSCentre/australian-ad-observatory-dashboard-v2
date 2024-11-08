export interface PlatformItemData {
	observations: Observation[];
	observers: Observers;
	advertiser: Advertiser;
	media: Media;
	engagement_data: EngagementData;
	targeting_data: TargetingData;
	NLI: Nli;
}

export interface Nli {
	tier1: { [key: string]: number };
	tier2: { [key: string]: number };
}

export interface Advertiser {
	linked_platforms: AdvertiserID;
	instagram_handle: AdvertiserID;
	instagram_url: AdvertiserID;
	page_url: AdvertiserID;
	page_like_count: AdvertiserID;
	current_page_name: AdvertiserID;
	country_iso_code: AdvertiserID;
	instagram_profile_picture_url: AdvertiserID;
	instagram_actor_name: AdvertiserID;
	page_is_profile_page: AdvertiserID;
	categories: AdvertiserID;
	brazil_tax_id: AdvertiserID;
	page_is_deleted: AdvertiserID;
	profile_picture_url: { [key: string]: null | string };
	page_name: AdvertiserID;
	advertiser_id: AdvertiserID;
	handle: { [key: string]: null | string };
	page_alias: AdvertiserID;
}

export interface AdvertiserID {
	[key: string]: unknown[] | null | string;
}

export interface EngagementData {
	id: ID;
	reach_estimate: ID;
	age_ranges: AgeRanges;
	female_percentages: AgeRanges;
	male_percentages: AgeRanges;
	nonbinary_percentages: AgeRanges;
	regions: AgeRanges;
	region_percentages: AgeRanges;
	impressions_text: ID;
	impressions_index: ID;
	sources: ID;
}

export interface AgeRanges {
	[key: string]: unknown[];
}

export interface ID {
	[key: string]: string[] | boolean | The1714461012_Class | null | string;
}

export interface The1714461012_Class {
	id: string;
	observation_id: string;
}

export interface Media {
	title: ID;
	archive_id: ID;
	business_id: ID;
	advertiser_id: ID;
	platform_item_id: ID;
	collation_id: ID;
	creative_id: ID;
	adlibrary_creation_time: ID;
	broadcast_start: ID;
	broadcast_end: ID;
	reshared: ID;
	reshared_source_url: ID;
	verified_publisher: ID;
	is_video: ID;
	cta_type: ID;
	sponsored_term: ID;
	byline: ID;
	caption: ID;
	link_url: ID;
	link_description: ID;
	cta_text: ID;
	upper_texts: ID;
	lower_texts: AgeRanges;
	image_urls: ID;
	video_urls: AgeRanges;
	card_image_urls: AgeRanges;
	card_cta_texts: AgeRanges;
	card_titles: AgeRanges;
	card_link_descriptions: AgeRanges;
	card_cta_types: AgeRanges;
	card_link_urls: AgeRanges;
	extra_urls: AgeRanges;
	sources: ID;
}

export interface Observation {
	id: string;
	observed_at: number;
	url: string;
	id_observer: string;
	WAIST: Waist[];
}

export interface Waist {
	type: string;
	age_min?: string;
	age_max?: string;
	gender?: string;
	location_name?: string;
	location_type?: null;
}

export interface Observers {
	af96e69484cdf81050a6f12a1ab68b3f: Af96E69484Cdf81050A6F12A1Ab68B3F;
}

export interface Af96E69484Cdf81050A6F12A1Ab68B3F {
	created_at: number;
	gender: string;
	gender_specify: null;
	age: string;
	postcode: string;
	income_bracket: string;
	level_education: string;
	language: string;
	language_specify: null;
	identify_aboriginal_torres_strait: boolean;
	employment_status: string;
	party_preference: string;
	party_preference_specify: null;
}

export interface TargetingData {
	id: ID;
	currency: ID;
	spend: ID;
	sources: ID;
}
