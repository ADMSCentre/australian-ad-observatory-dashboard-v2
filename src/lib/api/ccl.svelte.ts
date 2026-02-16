import { fetchCclEntities, fetchCclSnapshots } from './ccl';
import type { CclEntity, CclSnapshot } from '$lib/types/ccl';
import type { FetchCclEntitiesParams, FetchCclSnapshotsParams } from './ccl';

/**
 * Reactive state manager for CCL (Commercial Content Library) data.
 * Uses Svelte 5 runes for reactivity and provides cursor-based pagination
 * with in-memory caching.
 */
class CclEntitiesManager {
	items = $state<CclEntity[]>([]);
	loading = $state(false);
	error = $state<string | null>(null);
	currentCursor = $state<string | undefined>(undefined);
	nextCursor = $state<string | null>(null);
	hasMore = $state(true);
	total = $state(0);

	// Cursor history for previous/next page navigation
	private cursorHistory = $state<(string | undefined)[]>([]);
	private pageIndex = $state(0);

	private cache = new Map<
		string,
		{ items: CclEntity[]; nextCursor: string | null; total: number }
	>();

	private getCacheKey(cursor?: string, limit?: number, search?: string): string {
		return `${cursor ?? 'start'}_${limit ?? 20}_${search ?? ''}`;
	}

	async load(params: FetchCclEntitiesParams = {}) {
		const cacheKey = this.getCacheKey(params.cursor, params.limit, params.search);

		if (this.cache.has(cacheKey)) {
			const cached = this.cache.get(cacheKey)!;
			this.items = cached.items;
			this.nextCursor = cached.nextCursor;
			this.hasMore = cached.nextCursor !== null;
			this.total = cached.total;
			this.currentCursor = params.cursor;
			return;
		}

		this.loading = true;
		this.error = null;

		try {
			const response = await fetchCclEntities(params);
			this.items = response.entities;
			this.nextCursor = response.pagination.next_cursor;
			this.hasMore = response.pagination.next_cursor !== null;
			this.total = response.pagination.total;
			this.currentCursor = params.cursor;

			this.cache.set(cacheKey, {
				items: response.entities,
				nextCursor: response.pagination.next_cursor,
				total: response.pagination.total
			});
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Failed to load entities';
		} finally {
			this.loading = false;
		}
	}

	async loadFirst(params: Omit<FetchCclEntitiesParams, 'cursor'> = {}) {
		this.cursorHistory = [undefined];
		this.pageIndex = 0;
		await this.load({ ...params, cursor: undefined });
	}

	async loadNext(params: Omit<FetchCclEntitiesParams, 'cursor'> = {}) {
		if (!this.nextCursor) return;
		this.pageIndex += 1;
		if (this.cursorHistory.length <= this.pageIndex) {
			this.cursorHistory.push(this.nextCursor);
		}
		await this.load({ ...params, cursor: this.nextCursor });
	}

	async loadPrevious(params: Omit<FetchCclEntitiesParams, 'cursor'> = {}) {
		if (this.pageIndex <= 0) return;
		this.pageIndex -= 1;
		const cursor = this.cursorHistory[this.pageIndex];
		await this.load({ ...params, cursor });
	}

	get hasPrevious(): boolean {
		return this.pageIndex > 0;
	}

	get currentPage(): number {
		return this.pageIndex + 1;
	}

	clearCache() {
		this.cache.clear();
	}
}

class CclSnapshotsManager {
	items = $state<CclSnapshot[]>([]);
	loading = $state(false);
	error = $state<string | null>(null);
	currentCursor = $state<string | undefined>(undefined);
	nextCursor = $state<string | null>(null);
	hasMore = $state(true);
	total = $state(0);

	private cursorHistory = $state<(string | undefined)[]>([]);
	private pageIndex = $state(0);

	private cache = new Map<
		string,
		{ items: CclSnapshot[]; nextCursor: string | null; total: number }
	>();

	private getCacheKey(cursor?: string, limit?: number, search?: string): string {
		return `${cursor ?? 'start'}_${limit ?? 20}_${search ?? ''}`;
	}

	async load(params: FetchCclSnapshotsParams = {}, mode: 'replace' | 'append' = 'replace') {
		const cacheKey = this.getCacheKey(params.cursor, params.limit, params.search);

		if (this.cache.has(cacheKey)) {
			const cached = this.cache.get(cacheKey)!;
			// this.items = cached.items;
			this.items = mode === 'append' ? [...this.items, ...cached.items] : cached.items;
			this.nextCursor = cached.nextCursor;
			this.hasMore = cached.nextCursor !== null;
			this.total = cached.total;
			this.currentCursor = params.cursor;
			return;
		}

		this.loading = true;
		this.error = null;

		try {
			const response = await fetchCclSnapshots(params);
			// this.items = response.snapshots;
			this.items = mode === 'append' ? [...this.items, ...response.snapshots] : response.snapshots;
			this.nextCursor = response.pagination.next_cursor;
			this.hasMore = response.pagination.next_cursor !== null;
			this.total = response.pagination.total;
			this.currentCursor = params.cursor;

			this.cache.set(cacheKey, {
				items: response.snapshots,
				nextCursor: response.pagination.next_cursor,
				total: response.pagination.total
			});
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Failed to load snapshots';
		} finally {
			this.loading = false;
		}
	}

	async loadFirst(params: Omit<FetchCclSnapshotsParams, 'cursor'> = {}) {
		this.cursorHistory = [undefined];
		this.pageIndex = 0;
		await this.load({ ...params, cursor: undefined });
	}

	async loadNext(
		params: Omit<FetchCclSnapshotsParams, 'cursor'> = {},
		mode: 'replace' | 'append' = 'replace'
	) {
		if (!this.nextCursor) return;
		this.pageIndex += 1;
		if (this.cursorHistory.length <= this.pageIndex) {
			this.cursorHistory.push(this.nextCursor);
		}
		await this.load({ ...params, cursor: this.nextCursor }, mode);
	}

	async loadPrevious(params: Omit<FetchCclSnapshotsParams, 'cursor'> = {}) {
		if (this.pageIndex <= 0) return;
		this.pageIndex -= 1;
		const cursor = this.cursorHistory[this.pageIndex];
		await this.load({ ...params, cursor });
	}

	get hasPrevious(): boolean {
		return this.pageIndex > 0;
	}

	get currentPage(): number {
		return this.pageIndex + 1;
	}

	clearCache() {
		this.cache.clear();
	}
}

/**
 * Cache for CCL availability checks per observation.
 * Used by the ads-browser to show CCL Available / No CCL badges.
 */
class CclAvailabilityCache {
	private cache = $state<Record<string, boolean>>({});
	private loading = $state<Record<string, boolean>>({});

	isLoading(observationId: string): boolean {
		return this.loading[observationId] ?? false;
	}

	isAvailable(observationId: string): boolean | undefined {
		return this.cache[observationId];
	}

	hasChecked(observationId: string): boolean {
		return observationId in this.cache;
	}

	async check(observationId: string) {
		if (this.hasChecked(observationId) || this.isLoading(observationId)) return;

		this.loading[observationId] = true;
		try {
			const response = await fetchCclSnapshots({ observation_id: observationId, limit: 1 });
			this.cache[observationId] = response.snapshots.length > 0;
		} catch {
			this.cache[observationId] = false;
		} finally {
			this.loading[observationId] = false;
		}
	}
}

export const cclEntities = new CclEntitiesManager();
export const cclSnapshots = new CclSnapshotsManager();
export const cclAvailability = new CclAvailabilityCache();
