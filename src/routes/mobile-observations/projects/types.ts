import type { Query } from '../query/query';

export interface TeamMember {
	username: string;
	role: 'admin' | 'editor' | 'viewer';
}

export interface BaseCell {
	config?: {
		[key: string]: unknown;
	};
	hasChanges?: boolean;
}

export interface TextCell extends BaseCell {
	id: string;
	type: 'text';
	content: string;
}

export interface QueryResultConfig {
	[key: string]: unknown;
}

export const VISUALISATION_TYPES = ['raw', 'observer-table', 'timeline', 'ads-browser'] as const;

export interface QueryResult {
	id: string;
	type: (typeof VISUALISATION_TYPES)[number];
	config?: QueryResultConfig;
}

export interface QueryCellContent {
	query: Query;

	results: QueryResult[];
}

export interface QueryCell extends BaseCell {
	id: string;
	type: 'query';
	content: QueryCellContent;
}

export type Cell = TextCell | QueryCell;

export interface Project {
	id: string;
	name: string;
	description: string;
	ownerId: string;
	team: TeamMember[];
	cells: Cell[];
}
