import type { Query } from '../mobile-observations/query/query';

export interface ExportField {
	id: string;
	name: string;
	description: string;
	path: string;
	is_default: boolean;
}

export interface ExportParameters {
	query: Query;
	include_images: boolean;
	fields: string[];
}

export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'expired';

export interface Export {
	export_id: string;
	creator_id: string;
	export_parameters: ExportParameters;
	shared_with: string[];
	status: ExportStatus;
	url: string | null;
	created_at: string;
	updated_at: string;
	started_at: string | null;
	completed_at: string | null;
	message: string | null;
}
