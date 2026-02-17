import { client } from './client';
import { auth } from './auth/auth.svelte';
import type {
	CclEntitiesResponse,
	CclSnapshotsResponse,
	CclEntity,
	CclSnapshot,
	CclPagination
} from '$lib/types/ccl';

export interface FetchCclEntitiesParams {
	limit?: number;
	cursor?: string;
	observation_id?: string;
	observer_id?: string;
	platform?: string;
	type?: string;
	search?: string;
}

export interface FetchCclSnapshotsParams {
	limit?: number;
	cursor?: string;
	observation_id?: string;
	observer_id?: string;
	platform?: string;
	search?: string;
}

/**
 * Fetch a paginated list of CCL entities (advertisers).
 */
export async function fetchCclEntities(
	params: FetchCclEntitiesParams = {}
): Promise<CclEntitiesResponse> {
	const { limit = 20, cursor, observation_id, observer_id, platform, type, search } = params;

	const { data, error } = await client.GET('/ccl/entities', {
		params: {
			query: {
				limit,
				...(cursor && { cursor }),
				...(observation_id && { observation_id }),
				...(observer_id && { observer_id }),
				...(platform && { platform }),
				...(type && { type }),
				...(search && { search })
			}
		},
		headers: auth.headers
	});

	if (error) {
		throw new Error(`Failed to fetch CCL entities: ${JSON.stringify(error)}`);
	}

	return {
		success: data?.success ?? false,
		entities: (data?.entities as unknown as CclEntity[]) ?? [],
		pagination: (data?.pagination as unknown as CclPagination) ?? { next_cursor: null, total: 0 }
	};
}

/**
 * Fetch a paginated list of CCL snapshots (advertisements).
 */
export async function fetchCclSnapshots(
	params: FetchCclSnapshotsParams = {}
): Promise<CclSnapshotsResponse> {
	const { limit = 20, cursor, observation_id, observer_id, platform, search } = params;

	const { data, error } = await client.GET('/ccl/snapshots', {
		params: {
			query: {
				limit,
				...(cursor && { cursor }),
				...(observation_id && { observation_id }),
				...(observer_id && { observer_id }),
				...(platform && { platform }),
				...(search && { search })
			}
		},
		headers: auth.headers
	});

	if (error) {
		throw new Error(`Failed to fetch CCL snapshots: ${JSON.stringify(error)}`);
	}

	return {
		success: data?.success ?? false,
		snapshots: (data?.snapshots as unknown as CclSnapshot[]) ?? [],
		pagination: (data?.pagination as unknown as CclPagination) ?? { next_cursor: null, total: 0 }
	};
}
