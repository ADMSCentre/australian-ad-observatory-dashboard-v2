import { client } from '$lib/api/client';
import { auth } from '$lib/api/auth/auth.svelte';
import type { Export, ExportField } from './types';

class ExportsManager {
	exports = $state<Export[]>([]);
	fields = $state<ExportField[]>([]);
	loading = $state(false);
	fieldsLoading = $state(false);

	// Sorted exports (newest first)
	get sorted() {
		return this.exports
			.slice()
			.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
	}

	private get authHeader() {
		return { Authorization: `Bearer ${auth.token}` };
	}

	async fetchExports({ loading = true } = {}) {
		if (!auth.token) return;
		if (loading) this.loading = true;
		try {
			const { data, error } = await client.GET('/exports', {
				headers: this.authHeader
			});
			if (error) {
				console.error('Failed to fetch exports:', error);
				return;
			}
			this.exports = (data as unknown as Export[]) ?? [];
		} finally {
			if (loading) this.loading = false;
		}
	}

	async refreshExports({
		targets
	}: {
		targets: string[]; // List of export IDs to refresh
	}) {
		if (!auth.token) return;
		for (const exportId of targets) {
			const { data, error } = await client.GET('/exports/{export_id}', {
				headers: this.authHeader,
				params: { path: { export_id: exportId } }
			});
			if (error) {
				console.error(`Failed to refresh export ${exportId}:`, error);
				continue;
			}
			const updatedExport = data as unknown as Export;
			// Update the export in the local state
			const index = this.exports.findIndex((e) => e.export_id === exportId);
			if (index !== -1) {
				this.exports[index] = updatedExport;
			} else {
				this.exports.push(updatedExport);
			}
		}
	}

	async fetchFields() {
		if (!auth.token) return;
		this.fieldsLoading = true;
		try {
			const { data, error } = await client.GET('/exports/fields', {
				headers: this.authHeader
			});
			if (error) {
				console.error('Failed to fetch export fields:', error);
				return;
			}
			this.fields = (data as ExportField[]) ?? [];
		} finally {
			this.fieldsLoading = false;
		}
	}

	async createExport(params: {
		query: Record<string, unknown>;
		include_images: boolean;
		fields: string[];
	}): Promise<{ success: boolean; error?: string }> {
		if (!auth.token) return { success: false, error: 'Not authenticated' };

		const { error } = await client.POST('/exports', {
			headers: this.authHeader,
			body: {
				query: params.query as unknown as Record<string, never>,
				include_images: params.include_images,
				fields: params.fields
			}
		});

		if (error) {
			return { success: false, error: 'Failed to create export' };
		}

		await this.fetchExports();
		return { success: true };
	}

	async deleteExport(exportId: string): Promise<{ success: boolean; error?: string }> {
		if (!auth.token) return { success: false, error: 'Not authenticated' };

		const { error } = await client.DELETE('/exports/{export_id}', {
			headers: this.authHeader,
			params: { path: { export_id: exportId } }
		});

		if (error) {
			return { success: false, error: 'Failed to delete export' };
		}

		// Delete locally without refetching
		this.exports = this.exports.filter((e) => e.export_id !== exportId);

		await this.fetchExports({
			loading: false
		});
		return { success: true };
	}

	async shareExport(
		exportId: string,
		userIds: string[]
	): Promise<{ success: boolean; error?: string }> {
		if (!auth.token) return { success: false, error: 'Not authenticated' };

		const { error } = await client.POST('/exports/{export_id}/share', {
			headers: this.authHeader,
			params: { path: { export_id: exportId } },
			body: { user_ids: userIds }
		});

		if (error) {
			return { success: false, error: 'Failed to share export' };
		}

		await this.refreshExports({ targets: [exportId] });
		return { success: true };
	}

	async unshareExport(
		exportId: string,
		userIds: string[]
	): Promise<{ success: boolean; error?: string }> {
		if (!auth.token) return { success: false, error: 'Not authenticated' };

		const { error } = await client.POST('/exports/{export_id}/unshare', {
			headers: this.authHeader,
			params: { path: { export_id: exportId } },
			body: { user_ids: userIds }
		});

		if (error) {
			return { success: false, error: 'Failed to unshare export' };
		}

		await this.refreshExports({ targets: [exportId] });
		return { success: true };
	}

	getExportById(exportId: string): Export | undefined {
		return this.exports.find((e) => e.export_id === exportId);
	}

	async retryExport(exportId: string): Promise<{ success: boolean; error?: string }> {
		if (!auth.token) return { success: false, error: 'Not authenticated' };
		const exportData = this.getExportById(exportId);
		if (!exportData) return { success: false, error: 'Export not found' };
		// Create a new export with the same parameters
		const result = await this.createExport({
			query: exportData.export_parameters.query,
			include_images: exportData.export_parameters.include_images,
			fields: exportData.export_parameters.fields
		});
		// Then delete the old export
		if (result.success) {
			await this.deleteExport(exportId);
		}
		return result;
	}
}

export const exportsManager = new ExportsManager();
