/**
	 * All fields:
		observer.uuid
		observer.joined_at
		observer.device_dimensions.w
		observer.device_dimensions.h

		observation.uuid
		observation.observed_on_device_at
		observation.submitted_from_device_at
		observation.platform
		observation.exposure
		observation.media_bounds
		observation.whitespace_derived_color
		observation.ad_dimensions.w
		observation.ad_dimensions.h
		observation.video.n_seconds
		observation.video.n_frames
		observation.video.fps
		observation.keyframes.screenshot_cropped
		observation.keyframes.observed_at
		observation.keyframes.y_offset
		observation.keyframes.ocr_data.x
		observation.keyframes.ocr_data.y
		observation.keyframes.ocr_data.w
		observation.keyframes.ocr_data.h
		observation.keyframes.ocr_data.text
		observation.keyframes.ocr_data.confidence

		enrichment.meta_adlibrary_scrape.candidates.ad_library_scrape_candidates_i
		enrichment.meta_adlibrary_scrape.candidates.data.ad_archive_id
		enrichment.meta_adlibrary_scrape.candidates.data.categories
		enrichment.meta_adlibrary_scrape.candidates.data.collation_count
		enrichment.meta_adlibrary_scrape.candidates.data.collation_id
		enrichment.meta_adlibrary_scrape.candidates.data.contains_digital_created_media
		enrichment.meta_adlibrary_scrape.candidates.data.contains_sensitive_content
		enrichment.meta_adlibrary_scrape.candidates.data.currency
		enrichment.meta_adlibrary_scrape.candidates.data.end_date
		enrichment.meta_adlibrary_scrape.candidates.data.entity_type
		enrichment.meta_adlibrary_scrape.candidates.data.finserv_ad_data.is_deemed_finserv
		enrichment.meta_adlibrary_scrape.candidates.data.finserv_ad_data.is_limited_delivery
		enrichment.meta_adlibrary_scrape.candidates.data.gated_type
		enrichment.meta_adlibrary_scrape.candidates.data.has_user_reported
		enrichment.meta_adlibrary_scrape.candidates.data.hidden_safety_data
		enrichment.meta_adlibrary_scrape.candidates.data.hide_data_status
		enrichment.meta_adlibrary_scrape.candidates.data.impressions_with_index.impressions_index
		enrichment.meta_adlibrary_scrape.candidates.data.is_aaa_eligible
		enrichment.meta_adlibrary_scrape.candidates.data.is_active
		enrichment.meta_adlibrary_scrape.candidates.data.is_profile_page
		enrichment.meta_adlibrary_scrape.candidates.data.page_id
		enrichment.meta_adlibrary_scrape.candidates.data.page_is_deleted
		enrichment.meta_adlibrary_scrape.candidates.data.page_name
		enrichment.meta_adlibrary_scrape.candidates.data.publisher_platform
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.body.text
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.caption
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.cta_text
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.cta_type
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.current_page_name
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.display_format
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.is_reshared
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.link_description
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.link_url
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.page_categories
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.page_entity_type
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.page_id
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.page_is_deleted
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.page_is_profile_page
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.page_like_count
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.page_name
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.page_profile_picture_url
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.page_profile_uri
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.title
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.videos.video_hd_url
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.videos.video_preview_image_url
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.videos.video_sd_url
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.videos.watermarked_video_hd_url
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.videos.watermarked_video_sd_url
		enrichment.meta_adlibrary_scrape.candidates.data.start_date
		enrichment.meta_adlibrary_scrape.candidates.data.archive_types
		enrichment.meta_adlibrary_scrape.candidates.data.impressions_with_index.impressions_text
		enrichment.meta_adlibrary_scrape.candidates.data.political_countries
		enrichment.meta_adlibrary_scrape.candidates.data.reach_estimate
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.images.original_image_url
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.images.resized_image_url
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.images.watermarked_resized_image_url
		enrichment.meta_adlibrary_scrape.candidates.data.spend
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.cards.body
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.cards.caption
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.cards.cta_text
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.cards.cta_type
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.cards.link_description
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.cards.link_url
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.cards.original_image_url
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.cards.resized_image_url
		enrichment.meta_adlibrary_scrape.candidates.data.snapshot.cards.watermarked_resized_image_url
		enrichment.meta_adlibrary_scrape.rankings.this_selected_candidate_i
		enrichment.meta_adlibrary_scrape.rankings.ranking_pct
		enrichment.meta_adlibrary_scrape.rankings.components.ocr_coverage
		enrichment.meta_adlibrary_scrape.rankings.components.rankings_from_images
		enrichment.meta_adlibrary_scrape.rankings.components.ranking_from_videos

		enrichment.meta_adlibrary_scrape.scraped_at
		enrichment.meta_adlibrary_scrape.reference.caller.observer_uuid
		enrichment.meta_adlibrary_scrape.reference.caller.tentative_ad
		enrichment.meta_adlibrary_scrape.reference.scrape.observer_uuid
		enrichment.meta_adlibrary_scrape.reference.scrape.tentative_ad
		enrichment.meta_adlibrary_scrape.query.restitched_image_key
		enrichment.meta_adlibrary_scrape.query.value
		enrichment.meta_adlibrary_scrape.query.confidence
	 */

import type { Candidate, Ranking, RichDataObject } from './rich-data-object-type';
import type { RichAdData } from './types';

function parseTimestamp(value: string | number | boolean | null) {
	// First attempt to convert the value to a number
	if (isNaN(Number(value))) return value;
	let timestamp = Number(value);
	// Should be in milliseconds
	if (timestamp < 10000000000) timestamp *= 1000;
	const date = new Date(Number(timestamp));
	return date.toLocaleDateString('en-GB', {
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric'
	});
}

function round(value: string | number | boolean | null, precision: number = 0) {
	if (typeof value === 'number') return value.toFixed(precision);
	return value;
}

export const FIELD_GROUPS: {
	name: string;
	description: string;
	open: boolean;
	fields: {
		key: string;
		title: string;
		description: string;
		format?: (value: string | number | boolean | null) => string | number | boolean | null;
	}[];
}[] = [
	{
		name: 'Observer Data',
		description: 'Data about the observer and their device',
		open: true,
		fields: [
			{
				key: 'observer.uuid',
				title: 'Activation Code',
				description: 'The unique identifier of the observer'
			},
			{
				key: 'observer.joined_at',
				title: 'Joined At',
				description: 'The date the observer joined the platform',
				format: parseTimestamp
			},
			{
				key: 'observer.device_dimensions.w',
				title: 'Device Width',
				description: "The width of the observer's device"
			},
			{
				key: 'observer.device_dimensions.h',
				title: 'Device Height',
				description: "The height of the observer's device"
			}
		]
	},
	{
		name: 'Observation Data',
		description: 'Data about the observation',
		open: true,
		fields: [
			{
				key: 'observation.uuid',
				title: 'Observation ID',
				description: 'The unique identifier of the observation'
			},
			{
				key: 'observation.observed_on_device_at',
				title: 'Observed On Device At',
				description: 'The timestamp when the observation was made on the device',
				format: parseTimestamp
			},
			{
				key: 'observation.submitted_from_device_at',
				title: 'Submitted From Device At',
				description: 'The timestamp when the observation was submitted from the device',
				format: parseTimestamp
			},
			{
				key: 'observation.platform',
				title: 'Platform',
				description: 'The platform on which the observation was made'
			},
			{
				key: 'observation.exposure',
				title: 'Exposure',
				description: 'The exposure details of the observation'
			},
			{
				title: 'Ad Width',
				key: 'observation.ad_dimensions.w',
				description: 'The width of the ad in the observation'
			},
			{
				title: 'Ad Height',
				key: 'observation.ad_dimensions.h',
				description: 'The height of the ad in the observation'
			},
			// {
			// 	title: 'Video Duration (seconds)',
			// 	key: 'observation.video.n_seconds',
			// 	description: 'The duration of the video in the observation',
			// 	format: (value) => round(value, 2)
			// },
			// {
			// 	title: 'Video Frames',
			// 	key: 'observation.video.n_frames',
			// 	description: 'The number of frames in the video'
			// },
			// {
			// 	title: 'Video FPS',
			// 	key: 'observation.video.fps',
			// 	description: 'The frames per second of the video',
			// 	format: (value) => round(value, 2)
			// },
			{
				title: 'Starred',
				key: 'attributes.starred.value',
				description: 'Whether the observation is starred',
				format: (value) => !!value
			},
			{
				title: 'Star Updated At',
				key: 'attributes.starred.modified_at',
				description: 'The timestamp when the observation starred status was updated',
				format: parseTimestamp
			},
			{
				title: 'Star Updated By',
				key: 'attributes.starred.modified_by',
				description: 'The user who starred the observation'
			},
			{
				title: 'Hidden',
				key: 'attributes.hidden.value',
				description: 'Whether the observation is hidden',
				format: (value) => !!value
			},
			{
				title: 'Visibility Updated At',
				key: 'attributes.hidden.modified_at',
				description: 'The timestamp when the observation hidden status was updated',
				format: parseTimestamp
			},
			{
				title: 'Visibility Updated By',
				key: 'attributes.hidden.modified_by',
				description: 'The user who hid the observation'
			}
		]
	},
	{
		name: 'Meta Candidates',
		description: 'Data about the candidates from the Meta Ad Library',
		open: false,
		fields: [
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.ad_archive_id',
				title: 'Ad Archive ID',
				description: 'The ID of the ad in the archive'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.page_id',
				title: 'Page ID',
				description: 'The ID of the page associated with the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.page_name',
				title: 'Page Name',
				description: 'The name of the page associated with the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.categories',
				title: 'Categories',
				description: 'The categories of the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.is_active',
				title: 'Is Active',
				description: 'Whether the ad is currently active'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.snapshot.page_categories',
				title: 'Page Categories',
				description: 'The categories of the page associated with the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.start_date',
				title: 'Start Date',
				description: 'The start date of the ad campaign',
				format: parseTimestamp
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.end_date',
				title: 'End Date',
				description: 'The end date of the ad campaign',
				format: parseTimestamp
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.collation_count',
				title: 'Collation Count',
				description: 'The number of collations for the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.currency',
				title: 'Currency',
				description: 'The currency used for the ad spend'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.impressions_with_index.impressions_text',
				title: 'Impressions Text',
				description: 'The impressions text of the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.reach_estimate',
				title: 'Reach Estimate',
				description: 'The reach estimate of the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.impressions_with_index.impressions_index',
				title: 'Impressions Index',
				description: 'The impressions index of the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.spend',
				title: 'Spend',
				description: 'The spend data of the ad'
			},
			// Rankings
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.ranking.ranking_pct',
				title: 'Ranking Overall',
				description: 'The overall ranking percentage of the ad',
				format: (value) => round(value, 2)
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.ranking.components.ocr_coverage',
				title: 'OCR Coverage',
				description: 'The OCR coverage of the ad',
				format: (value) => round(value, 2)
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.ranking.components.rankings_from_images',
				title: 'Ranking from Images',
				description: 'The ranking from images of the ad',
				format: (value) => round(value, 2)
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.ranking.components.ranking_from_videos',
				title: 'Ranking from Videos',
				description: 'The ranking from videos of the ad',
				format: (value) => round(value, 2)
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.snapshot.title',
				title: 'Snapshot Title',
				description: 'The title of the snapshot associated with the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.contains_sensitive_content',
				title: 'Contains Sensitive Content',
				description: 'Indicates if the ad contains sensitive content'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.page_is_deleted',
				title: 'Page Is Deleted',
				description: 'Indicates if the page associated with the ad is deleted'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.snapshot.link_url',
				title: 'Snapshot Link URL',
				description: 'The URL link in the snapshot associated with the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.snapshot.page_profile_picture_url',
				title: 'Page Profile Picture URL',
				description: 'The profile picture URL of the page associated with the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.snapshot.videos.video_hd_url',
				title: 'Video HD URL',
				description: 'The HD video URL in the snapshot associated with the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.snapshot.videos.video_preview_image_url',
				title: 'Snapshot Video Preview Image URL',
				description: 'The preview image URL of the video in the snapshot associated with the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.snapshot.videos.video_sd_url',
				title: 'Video SD URL',
				description: 'The SD video URL in the snapshot associated with the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.snapshot.videos.watermarked_video_hd_url',
				title: 'Snapshot Watermarked Video HD URL',
				description: 'The watermarked HD video URL in the snapshot associated with the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.snapshot.videos.watermarked_video_sd_url',
				title: 'Snapshot Watermarked Video SD URL',
				description: 'The watermarked SD video URL in the snapshot associated with the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.snapshot.images.original_image_url',
				title: 'Original Image URL',
				description: 'The original image URL in the snapshot associated with the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.snapshot.images.resized_image_url',
				title: 'Resized Image URL',
				description: 'The resized image URL in the snapshot associated with the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.snapshot.images.watermarked_resized_image_url',
				title: 'Watermarked Resized Image URL',
				description: 'The watermarked resized image URL in the snapshot associated with the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.snapshot.cards.body',
				title: 'Card Body',
				description: 'The body text of the card in the snapshot associated with the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.snapshot.cards.caption',
				title: 'Card Caption',
				description: 'The caption of the card in the snapshot associated with the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.snapshot.cards.cta_text',
				title: 'Card CTA Text',
				description: 'The call to action text of the card in the snapshot associated with the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.snapshot.cards.cta_type',
				title: 'Card CTA Type',
				description: 'The call to action type of the card in the snapshot associated with the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.snapshot.cards.link_description',
				title: 'Card Link Description',
				description: 'The link description of the card in the snapshot associated with the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.snapshot.cards.link_url',
				title: 'Card Link URL',
				description: 'The link URL of the card in the snapshot associated with the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.snapshot.body.text',
				title: 'Snapshot Body Text',
				description: 'The body text of the snapshot associated with the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.snapshot.caption',
				title: 'Snapshot Caption',
				description: 'The caption of the snapshot associated with the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.snapshot.cta_text',
				title: 'Snapshot CTA Text',
				description: 'The call to action text of the snapshot associated with the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.snapshot.cta_type',
				title: 'Snapshot CTA Type',
				description: 'The call to action type of the snapshot associated with the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.snapshot.link_description',
				title: 'Snapshot Link Description',
				description: 'The link description of the snapshot associated with the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.snapshot.link_url',
				title: 'Snapshot Link URL',
				description: 'The URL link in the snapshot associated with the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.snapshot.page_is_deleted',
				title: 'Snapshot Page Is Deleted',
				description: 'Indicates if the page associated with the snapshot is deleted'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.snapshot.page_like_count',
				title: 'Snapshot Page Like Count',
				description: 'The like count of the page associated with the snapshot'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.snapshot.page_profile_uri',
				title: 'Snapshot Page Profile URI',
				description: 'The profile URI of the page associated with the snapshot'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.archive_types',
				title: 'Archive Types',
				description: 'The types of archives associated with the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.snapshot.page_name',
				title: 'Snapshot Page Name',
				description: 'The name of the page associated with the snapshot'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.snapshot.display_format',
				title: 'Snapshot Display Format',
				description: 'The display format of the snapshot associated with the ad'
			},
			{
				key: 'enrichment.meta_adlibrary_scrape.candidates.data.publisher_platform',
				title: 'Publisher Platform',
				description: 'The platform on which the ad was published'
			}
		]
	}
];

export function getField(key: string) {
	for (const group of FIELD_GROUPS) {
		const field = group.fields.find((field) => field.key === key);
		if (field) {
			return {
				...field,
				group: group.name
			};
		}
	}
	return undefined;
}

// Attach other attributes to the rich data object for export
export function attachRichDataObject(ad: RichAdData) {
	return {
		...ad.richDataObject,
		attributes: ad.attributes || {}
	};
}

export function cleanRdo(richDataObject: RichDataObject | undefined) {
	if (!richDataObject) return undefined;
	const getCandidateRanking = (index: number) => {
		const ranking = richDataObject.enrichment.meta_adlibrary_scrape.rankings.find(
			(r) => r.this_selected_candidate_i === index
		);
		return ranking;
	};

	// Remove irrelevant fields from the richDataObject
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const cleanedRichDataObject = { ...richDataObject } as any;

	delete cleanedRichDataObject.enrichment.meta_adlibrary_scrape.comparisons;
	delete cleanedRichDataObject.media;
	delete cleanedRichDataObject.observation.whitespace_derived_signature;

	// Join the candidates with their rankings
	cleanedRichDataObject.enrichment.meta_adlibrary_scrape.candidates.forEach(
		(
			candidate: Candidate & {
				ranking?: Ranking;
			},
			index: number
		) => {
			const ranking = getCandidateRanking(index);
			candidate.ranking = ranking;
		}
	);

	return cleanedRichDataObject;
}
