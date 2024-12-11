export interface RichDataObject {
	observer: Observer;
	observation: Observation;
	enrichment: Enrichment;
	media: string[];
}

export interface Enrichment {
	meta_adlibrary_scrape: MetaAdLibraryScrapeEnrichment;
}

export interface MetaAdLibraryScrapeEnrichment {
	comparisons: Comparisons;
	candidates: Candidate[];
	rankings: Ranking[];
	scraped_at: number;
	reference: Reference;
	query: Query;
}

export interface Candidate {
	ad_library_scrape_candidates_i: number;
	data: Data;
}

export interface Data {
	ad_archive_id: string;
	ad_id: null;
	archive_types: ArchiveType[];
	categories: Category[];
	collation_count: number;
	collation_id: string;
	contains_digital_created_media: boolean;
	contains_sensitive_content: boolean;
	currency: Currency;
	end_date: number;
	entity_type: EntityType;
	fev_info: null;
	finserv_ad_data: FinservAdData;
	gated_type: GatedType;
	has_user_reported: boolean;
	hidden_safety_data: boolean;
	hide_data_status: HideDataStatus;
	impressions_with_index: ImpressionsWithIndex;
	is_aaa_eligible: boolean;
	is_active: boolean;
	is_profile_page: boolean;
	menu_items: unknown[];
	page_id: string;
	page_is_deleted: boolean;
	page_name: string;
	political_countries: PoliticalCountry[];
	publisher_platform: PublisherPlatform[];
	reach_estimate: string | null;
	report_count: null;
	snapshot: Snapshot;
	spend: string | null;
	start_date: number;
	state_media_run_label: null;
	total_active_time: null;
}

export enum ArchiveType {
	Electoral = 'ELECTORAL'
}

export enum Category {
	Political = 'POLITICAL',
	Unknown = 'UNKNOWN'
}

export enum Currency {
	Aud = 'AUD',
	Empty = ''
}

export enum EntityType {
	PersonProfile = 'PERSON_PROFILE'
}

export interface FinservAdData {
	is_deemed_finserv: boolean;
	is_limited_delivery: boolean;
}

export enum GatedType {
	Eligible = 'ELIGIBLE',
	MissingDisclaimer = 'MISSING_DISCLAIMER'
}

export enum HideDataStatus {
	None = 'NONE'
}

export interface ImpressionsWithIndex {
	impressions_text: string | null;
	impressions_index: number;
}

export enum PoliticalCountry {
	Au = 'AU'
}

export enum PublisherPlatform {
	Facebook = 'FACEBOOK',
	Instagram = 'INSTAGRAM',
	Messenger = 'MESSENGER'
}

export interface Snapshot {
	body: Body;
	branded_content: null;
	brazil_tax_id: null;
	byline: null;
	caption: string | null;
	cards: Card[];
	cta_text: CtaText | null;
	cta_type: CtaType | null;
	country_iso_code: null;
	current_page_name: string;
	disclaimer_label: null;
	display_format: DisplayFormat;
	event: null;
	images: ImageElement[];
	is_reshared: boolean;
	link_description: null | string;
	link_url: null | string;
	page_categories: PageCategory[];
	page_entity_type: EntityType;
	page_id: string;
	page_is_deleted: boolean;
	page_is_profile_page: boolean;
	page_like_count: number;
	page_name: string;
	page_profile_picture_url: string;
	page_profile_uri: string;
	root_reshared_post: null;
	title: null | string;
	videos: VideoElement[];
	additional_info: null;
	ec_certificates: unknown[];
	extra_images: unknown[];
	extra_links: unknown[];
	extra_texts: unknown[];
	extra_videos: unknown[];
}

export interface Body {
	text: string;
}

export interface Card {
	body: string;
	caption: string;
	cta_text: string;
	cta_type: CtaType;
	image_crops: unknown[];
	link_description: string;
	link_url: string;
	original_image_url: string;
	resized_image_url: string;
	watermarked_resized_image_url: string;
	title: string;
	video_hd_url: null;
	video_preview_image_url: null;
	video_sd_url: null;
	watermarked_video_hd_url: null;
	watermarked_video_sd_url: null;
}

export enum CtaType {
	LearnMore = 'LEARN_MORE',
	NoButton = 'NO_BUTTON',
	SignUp = 'SIGN_UP'
}

export enum CtaText {
	LearnMore = 'Learn more',
	NoButton = 'No button',
	SignUp = 'Sign up'
}

export enum DisplayFormat {
	Dco = 'DCO',
	Image = 'IMAGE',
	Video = 'VIDEO'
}

export interface ImageElement {
	original_image_url: string;
	resized_image_url: string;
	watermarked_resized_image_url: string;
	image_crops: unknown[];
}

export enum PageCategory {
	PersonalBlog = 'Personal blog'
}

export interface VideoElement {
	video_hd_url: string;
	video_preview_image_url: string;
	video_sd_url: string;
	watermarked_video_hd_url: string;
	watermarked_video_sd_url: string;
}

export interface Comparisons {
	ocr: Ocr[];
	image: ComparisonsImage;
	video: ComparisonsVideo;
}

export interface ComparisonsImage {
	comparisons: Comparison[];
	ad_scrape_sources: AdScrapeSources;
}

export interface AdScrapeSources {
	[image_name: string]: MediaSource;
}

export interface MediaSource {
	key_path: Array<string | number>;
	media_url: string;
	ad_library_scrape_candidates_i: number;
}

export interface Comparison {
	restitched_image_key: string;
	scrape_media_key: string;
	result: Result;
}

export interface Result {
	coverage_pct: number;
	similarity_pct: number | null;
	comparison_pixel_n_samples: number;
}

export interface Ocr {
	ad_library_scrape_candidates_i: number;
	text_entries: TextEntry[];
	ocr_coverage_pct: number;
}

export interface TextEntry {
	result: string;
	key_path: Array<string | number>;
	ocr_matches: { [key: string]: OcrMatch[] | undefined };
}

export interface OcrMatch {
	i_within_window: number;
	levenshtein_result: number;
	reduced_ocr_text: string;
	reduced_ocr_data_index: number;
}

export interface ComparisonsVideo {
	comparisons: Comparison[];
	ad_scrape_sources: AdScrapeSources;
}

export interface Query {
	restitched_image_key: string;
	string: string;
	confidence: number;
}

export interface Ranking {
	this_selected_candidate_i: number;
	ranking_pct: number;
	components: Components;
}

export interface Components {
	ocr_coverage: number;
	rankings_from_images: number;
	ranking_from_videos: number | null;
}

export interface Reference {
	caller: Caller;
	scrape: Caller;
}

export interface Caller {
	observer_uuid: string;
	tentative_ad: string;
}

export interface Observation {
	uuid: string;
	observed_on_device_at: number;
	submitted_from_device_at: number;
	platform: string;
	exposure: string;
	media_bounds: Array<number[]>;
	whitespace_derived_color: string;
	whitespace_derived_signature: WhitespaceDerivedSignature[];
	ad_dimensions: Dimensions;
	video: ObservationVideo;
	keyframes: Keyframe[];
}

export interface Dimensions {
	w: number;
	h: number;
}

export interface Keyframe {
	screenshot_cropped: string;
	observed_at: number;
	y_offset: number;
	ocr_data: OcrDatum[];
}

export interface OcrDatum {
	x: number;
	y: number;
	w: number;
	h: number;
	text: string;
	confidence: number;
}

export interface ObservationVideo {
	n_seconds: number;
	n_frames: number;
	fps: number;
}

export interface WhitespaceDerivedSignature {
	y: number;
	whitespace_confidence_pct: number;
	whitespace_confidence_n_samples: number;
}

export interface Observer {
	uuid: string;
	demographic_characteristics: DemographicCharacteristics;
	joined_at: number;
	device_dimensions: Dimensions;
}

export type DemographicCharacteristics = object;
