import { auth } from '$lib/api/auth/auth.svelte';
import type { Query } from 'mobile-observations/query/query';
import { client } from '$lib/api/client';

const PAGE_SIZE = 5000;

export class QueryState {
  paths = $state<string[]>([]);
  success = $state<boolean>(false);
  total = $state<number>(0);
  running = $state<boolean>(false);
  aborted = $state<boolean>(false);

  constructor(public query: Query) { }

  abort(): void {
    this.aborted = true;
  }

  async fetch(): Promise<QueryState> {
    if (this.aborted) return this;
    this.running = true;
    const { data, error } = await client.POST('/ads/query', {
      headers: auth.headers,
      body: this.query as Record<string, unknown>
    });
    if (error) {
      throw error;
    }
    this.success = !!data.success;
    this.paths = data.result || [];
    this.total = data.result?.length || 0;
    this.running = false;
    return this;
  }
}

class PaginatedQueryState extends QueryState {
  pageSize = $state<number>(PAGE_SIZE);
  sessionId = $state<string | null>(null);
  continuationKey = $state<string | null>(null);

  constructor(query: Query) {
    super(query);
  }

  async getSessionId(): Promise<string> {
    const { data, error } = await client.GET('/ads/query/new-session', {
      headers: auth.headers,
    });
    if (error) {
      throw error;
    }
    if (!data.session_id) {
      throw new Error('Failed to create query session');
    }
    return data.session_id;
  }

  async fetch(): Promise<QueryState> {
    if (this.aborted) return this;
    if (!this.sessionId) {
      this.running = true;
      this.sessionId = await this.getSessionId();
    }
    console.log('Fetching ads with sessionId:', this.sessionId, 'continuationKey:', this.continuationKey);
    const { data, error } = await client.POST('/ads/query', {
      headers: auth.headers,
      body: {
        ...this.query as Record<string, unknown>,
        session_id: this.sessionId,
        context: {
          continuation_key: this.continuationKey ?? undefined,
          page_size: this.pageSize
        }
      }
    });
    if (error) {
      throw error;
    }
    this.success = !!data.success;
    if (!this.success) {
      throw new Error('Query failed')
    }
    this.paths = [...this.paths, ...(data.result || [])];
    this.total = data.context?.total_results || 0;
    this.continuationKey = data.context?.continuation_key || null;
    if (this.continuationKey) return this.fetch(); // Fetch next page if continuation key is present
    this.running = false;
    return this;
  }
}

export class QueryApiAdapter {
  prepare(query: Query, paginated: boolean = false): QueryState {
    if (!auth.token) {
      throw new Error('Not authenticated');
    }
    const response = paginated ? new PaginatedQueryState(query) : new QueryState(query);
    return response;
  }
}
