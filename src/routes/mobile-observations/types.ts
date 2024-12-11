import type { RichDataObject } from './rich-data-object-type';

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
};
