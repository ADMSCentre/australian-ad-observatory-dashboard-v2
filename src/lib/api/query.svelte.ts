import { useDashboardAPI } from './use-dashboard';

export interface QueryResponse {
	success: boolean;
	data: QueryData;
}

export interface QueryData {
	results: Results;
	errors: unknown[];
	time_taken: number;
	statement: string;
	presigned_urls: { [key: string]: string };
}

export interface Results {
	platform_item_ids: Array<Array<null | string>>;
	n_total: string;
	n_paginated: number;
	next_pagination_id: number;
}

export async function useQueryApi({
	token,
	paginationId,
	booleanFilterDataStructure
}: {
	token: string;
	paginationId: number;
	booleanFilterDataStructure: unknown;
}) {
	const data = {
		session_token: token,
		query: {
			debug: 'mellon',
			number_of_results_to_get: 10,
			remove_missing_entries: false,
			pagination_id: paginationId,
			boolean_filter_data_structure: booleanFilterDataStructure
		}
	};
	console.log('useQueryApi', data);
	const response: QueryResponse = await useDashboardAPI({ actionType: 'platform_items_v3', data });

	return response;
}
