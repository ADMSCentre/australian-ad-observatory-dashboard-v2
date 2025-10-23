import { auth } from "$lib/api/auth/auth.svelte";
import { client } from "$lib/api/client";

export interface IHiddenAd {
  observerId: string;
  timestamp: number;
  observationId: string;
  hiddenAt: number;
  hiddenBy: {
    userId: string;
    fullname: string;
  };
  ignored: boolean;
}

class HiddenAd implements IHiddenAd {
  observerId: string;
  timestamp: number;
  observationId: string;
  hiddenAt: number;
  hiddenBy: {
    userId: string;
    fullname: string;
  }
  ignored: boolean;
  private _manager: HiddenAdsManager;
  private _loading = $state<{
    restore: boolean;
    delete: boolean;
    toggleIgnore: boolean;
  }>({
    restore: false,
    delete: false,
    toggleIgnore: false
  });
  private _error = $state<{
    restore: string | null;
    delete: string | null;
    toggleIgnore: string | null;
  }>({
    restore: null,
    delete: null,
    toggleIgnore: null
  });

  get loading() {
    return {
      ...this._loading,
      any: Object.values(this._loading).some(v => v)
    }
  }

  constructor(data: IHiddenAd, manager: HiddenAdsManager) {
    this.observerId = data.observerId;
    this.timestamp = data.timestamp;
    this.observationId = data.observationId;
    this.hiddenAt = data.hiddenAt;
    this.hiddenBy = data.hiddenBy;
    this.ignored = data.ignored;
    this._manager = manager;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _act<T extends (...args: any[]) => any>(
    targetField: keyof HiddenAd['_loading'],
    action: (...args: Parameters<T>) => ReturnType<T>
  ) {
    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      this._loading[targetField] = true;
      this._error[targetField] = null;
      try {
        const result = await action(...args);
        return result;
      } catch (error: unknown) {
        if (error instanceof Error) {
          this._error[targetField] = error.message;
        }
        throw error;
      } finally {
        this._loading[targetField] = false;
      }
    }
  }

  /**
   * Unhide the ad
   */
  restore = this._act(
    'restore',
    async () => {
      const { error } = await client.PUT('/ads/{observer_id}/{timestamp}.{ad_id}/attributes', {
        headers: auth.headers,
        params: {
          path: {
            observer_id: this.observerId,
            timestamp: `${this.timestamp}`,
            ad_id: this.observationId
          },
        },
        body: {
          attribute: {
            key: 'hidden',
            value: 'false'
          }
        }
      })
      if (error) {
        throw error;
      }
      await this._manager.pop(this);
    });

  delete = this._act(
    'delete',
    async () => {
      const { error } = await client.DELETE('/ads/{observer_id}/{timestamp}.{ad_id}', {
        headers: auth.headers,
        params: {
          path: {
            observer_id: this.observerId,
            timestamp: `${this.timestamp}`,
            ad_id: this.observationId
          },
        }
      });
      if (error) {
        throw error;
      }
      await this._manager.pop(this);
    })

  toggleIgnore = this._act(
    'toggleIgnore',
    async (target: boolean = true) => {
      const { error } = await client.PUT('/ads/{observer_id}/{timestamp}.{ad_id}/attributes', {
        headers: auth.headers,
        params: {
          path: {
            observer_id: this.observerId,
            timestamp: `${this.timestamp}`,
            ad_id: this.observationId
          },
        },
        body: {
          attribute: {
            key: 'hidden_ignored',
            value: target ? 'True' : 'False'
          }
        }
      })
      if (error) {
        throw error;
      }
      await this._manager.pop(this);
    });
}

class HiddenAdsManager {
  private _hiddenAds = $state<HiddenAd[]>([]);
  private _pagination = $state<{
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
  } | null>(null);
  private _latestFetchConfig = $state<{
    page?: number;
    pageSize?: number;
    include?: 'all' | 'ignored' | 'not_ignored';
  }>({});

  get items() {
    return {
      hidden: this._hiddenAds,
      ignored: this._hiddenAds.filter(ad => ad.ignored),
      all: this._hiddenAds
    }
  }

  get pagination() {
    return this._pagination;
  }

  async fetch({
    page = 1,
    pageSize = 10,
    include = 'not_ignored'
  }: typeof this._latestFetchConfig
    = {}) {
    // Should call the API endpoint to fetch hidden ads
    const { data, error } = await client.GET('/ads/hidden', {
      headers: auth.headers,
      params: {
        query: {
          page,
          page_size: pageSize,
          include
        }
      }
    })

    if (error) {
      console.error("Failed to fetch hidden ads:", error);
      return;
    }

    if (!data || !data.success || !data.hidden_ads || !data.pagination) {
      console.error("Invalid data received when fetching hidden ads");
      return;
    }

    this._hiddenAds = Object.values(data.hidden_ads
      // Ensure uniqueness of observation_id
      .reduce<Record<string, HiddenAd>>((acc, d) => {
        if (!acc[d.observation_id!]) {
          acc[d.observation_id!] = new HiddenAd({
            observerId: d.observer_id!,
            timestamp: d.timestamp!,
            observationId: d.observation_id!,
            hiddenAt: d.hidden_at!,
            hiddenBy: {
              userId: d.hidden_by!.user_id!,
              fullname: d.hidden_by!.fullname!
            },
            ignored: d.ignored!
          }, this);
        }
        return acc;
      }, {}))

    if (data.pagination) this._pagination = {
      page: data.pagination.current_page!,
      limit: data.pagination.limit!,
      totalRecords: data.pagination.total_records!,
      totalPages: data.pagination.total_pages!
    };

    this._latestFetchConfig = { page, pageSize, include };
  }

  async pop(ad: HiddenAd) {
    this._hiddenAds = this._hiddenAds.filter(item => item !== ad);
    if (!this._pagination) return;
    this._pagination.totalRecords -= 1;
  }
}

export const hiddenAdsManager = new HiddenAdsManager();