export type ExpandType =
	| 'attributes'
	| 'richDataObject'
	| 'rawFrames'
	| 'stitchedFrames'
	| 'dimensions'
	| 'metaLibraryScrape'
	| 'ocrData';

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
	richDataObject?: RichDataObject;
	rawFrames?: string[];
	stitchedFrames?: string[];
	ocrData?: {
		screenshot_cropped?: string;
		y_offset?: number;
		observed_at?: string;
		ocr_data?: {
			text?: string;
			x?: number;
			y?: number;
			width?: number;
			height?: number;
			confidence?: number;
		}[];
	}[];
	dimensions: {
		w: number;
		h: number;
	};
	metaLibraryScrape?: {
		candidates: unknown[];
		mediaPaths: {
			[key: string]: string;
		};
		rankings: unknown[];
	};
};
