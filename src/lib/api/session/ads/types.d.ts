import { RichDataObject } from './rich-data-object-type';

export type ExpandType =
	| 'attributes'
	| 'richDataObject'
	| 'tags'
	// | 'rawFrames'
	| 'stitchedFrames'
	// | 'dimensions'
	| 'classifications'
	| 'metaLibraryScrape';
// | 'ocrData';

export type IndexGroupType =
	| 'observations'
	| 'ads'
	| 'ads_passed_ocr'
	| 'ads_passed_ad_scrape'
	| 'ads_passed_mass_download'
	| 'ads_passed_restitch'
	| 'ads_passed_relation'
	| 'ads_passed_rdo_construction';

export type ObservationIndex = {
	[key: string]: { observer: string; timestamp: string; adId: string; path: string }[];
};

export interface QuickAccessCacheResponse {
	success: boolean;
	data: ObservationIndex;
}

export type BasicAdData = {
	adId: string;
	timestamp: number;
	date: string;
	time: string;
	observer: string;
	path: string;
	types: string[];
};

export type RichAdData = BasicAdData & {
	attributes?: {
		[key: string]: {
			value?: string;
			createdBy?: string;
			createdAt?: string;
			modifiedBy?: string;
			modifiedAt?: string;
		};
	};
	tags?: string[];
	classifications?: {
		label: string;
		score: number;
	}[];
	richDataObject?: RichDataObject;
	stitchedFrames?: string[];
	metaLibraryScrape?: {
		candidates: unknown[];
		mediaPaths: {
			[key: string]: string;
		};
		rankings: unknown[];
	};
};
