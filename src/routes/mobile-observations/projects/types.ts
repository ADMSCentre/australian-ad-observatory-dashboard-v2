import type { Query } from '../query/query';

export interface TeamMember {
	username: string;
	role: 'admin' | 'editor' | 'viewer';
}

export interface TextCell {
	id: string;
	type: 'text';
	content: string;
}

export interface QueryResultConfig {
	[key: string]: unknown;
}

export interface QueryResult {
	id: string;
	type: 'raw' | 'table' | 'timeline' | 'ads-browser';
	config?: QueryResultConfig;
}

export interface QueryCellContent {
	query: Query;
	results: QueryResult[];
}

export interface QueryCell {
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
