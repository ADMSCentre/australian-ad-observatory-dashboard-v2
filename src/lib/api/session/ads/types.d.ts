export type ExpandType = 'attributes' | 'richDataObject' | 'rawFrames' | 'stitchedFrames';

export type IndexGroupType =
	| 'observations'
	| 'ads'
	| 'ads_passed_ocr'
	| 'ads_passed_ad_scrape'
	| 'ads_passed_mass_download'
	| 'ads_passed_restitch'
	| 'ads_passed_relation';

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
};
