export interface EntityData {
	name: string;
	likes: number;
	country: string | null;
	page_id: string;
	category: string;
	image_uri: string;
	page_alias: string;
	entity_type: string;
	ig_username: string | null;
	ig_followers: number | null;
	verification: 'BLUE_VERIFIED' | 'NOT_VERIFIED' | string;
	ig_verification: boolean | null;
	page_is_deleted: boolean;
	[key: string]: unknown;
}

export interface CclEntity {
	id: string;
	ccl_enrichment_id: string;
	source_id: string;
	type: string;
	name: string;
	data: EntityData;
}

export interface SnapshotCard {
	body: string;
	title: string;
	caption: string;
	cta_text: string;
	cta_type: string;
	link_url: string;
	image_crops: unknown[];
	video_hd_url: string | null;
	video_sd_url: string | null;
	link_description: string;
	resized_image_url: string;
	original_image_url: string;
	video_preview_image_url: string | null;
	watermarked_video_hd_url: string | null;
	watermarked_video_sd_url: string | null;
	watermarked_resized_image_url: string;
	[key: string]: unknown;
}

export interface SnapshotExtraImage {
	image_crops: unknown[];
	resized_image_url: string;
	original_image_url: string;
}

export interface SnapshotData {
	ad_id: string | null;
	spend: string | null;
	page_id: string;
	currency: string;
	end_date: number;
	fev_info: unknown;
	snapshot: {
		body: { text: string };
		cards: SnapshotCard[];
		event: unknown;
		title: string;
		byline: string | null;
		images: Array<{
			resized_image_url: string;
			original_image_url?: string;
			[key: string]: unknown;
		}>;
		videos: Array<{ video_hd_url: string | null; [key: string]: unknown }>;
		caption: string | null;
		page_id: string;
		cta_text: string | null;
		cta_type: string | null;
		link_url: string | null;
		page_name: string;
		extra_links: string[];
		extra_texts: Array<{ text: string }>;
		is_reshared: boolean;
		extra_images: SnapshotExtraImage[];
		extra_videos: unknown[];
		brazil_tax_id: string | null;
		display_format: string;
		additional_info: unknown;
		branded_content: unknown;
		ec_certificates: unknown[];
		page_categories: string[];
		page_is_deleted: boolean;
		page_like_count: number;
		country_iso_code: string | null;
		disclaimer_label: string | null;
		link_description: string | null;
		page_profile_uri: string;
		root_reshared_post: unknown;
		page_profile_picture_url: string;
		[key: string]: unknown;
	};
	is_active: boolean;
	page_name: string;
	categories: string[];
	gated_type: string;
	menu_items: unknown[];
	start_date: number;
	collation_id: string;
	report_count: number | null;
	ad_archive_id: string;
	reach_estimate: string | null;
	collation_count: number;
	is_aaa_eligible: boolean;
	page_is_deleted: boolean;
	hide_data_status: string;
	has_user_reported: boolean;
	total_active_time: number | null;
	publisher_platform: string[];
	state_media_run_label: string | null;
	impressions_with_index: {
		impressions_text: string | null;
		impressions_index: number;
	};
	is_related_to_query_term: boolean;
	targeted_or_reached_countries: string[];
	contains_digital_created_media: boolean;
	[key: string]: unknown;
}

export interface CclSnapshot {
	id: string;
	ccl_enrichment_id: string;
	source_id: string;
	data: SnapshotData;
	observed_in?: string[];
}

export interface CclPagination {
	next_cursor: string | null;
	total: number;
}

export interface CclEntitiesResponse {
	success: boolean;
	entities: CclEntity[];
	pagination: CclPagination;
}

export interface CclSnapshotsResponse {
	success: boolean;
	snapshots: CclSnapshot[];
	pagination: CclPagination;
}
