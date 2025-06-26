import { client } from './client';
import { auth } from '../auth/auth.svelte';
import JSZip from 'jszip';

interface DonationFile {
	name: string;
	content?: Record<string, unknown>;
}

export interface Donation {
	id: string;
	platform: string;
	timestamp: number;
	files: DonationFile[];
}

export class DownloadableDonation implements Donation {
	id: string;
	platform: string;
	timestamp: number;
	files: DonationFile[];

	constructor(donation: Donation) {
		this.id = donation.id;
		this.platform = donation.platform;
		this.timestamp = donation.timestamp;
		this.files = donation.files.map((file) => ({
			name: file.name,
			content: file.content
		}));
	}

	async download() {
		const zip = new JSZip();
		const filesWithContent = this.files.filter((file) => file.content);
		if (filesWithContent.length === 0) {
			throw new Error('No files available for download');
		}
		filesWithContent.forEach((file) => {
			zip.file(file.name, JSON.stringify(file.content, null, 2));
		});
		const content = await zip.generateAsync({ type: 'blob' });
		const url = URL.createObjectURL(content);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${this.platform}-${this.timestamp}.zip`;
		a.click();
	}
}

export class Donor {
	donations = $state<Donation[]>([]);
	status = $state<'idle' | 'loading' | 'error'>('idle');

	constructor(public id: string) {}

	async getDonations() {
		this.status = 'loading';
		const { data, error } = await client.GET('/donations/{user_id}', {
			params: {
				path: {
					user_id: this.id
				}
			}
		});
		if (error) {
			this.status = 'error';
			throw new Error(`Failed to fetch donations for user ${this.id}: ${error}`);
		}
		const donations = data.donations || [];
		this.donations = donations.map((donation) => ({
			id: `${donation.platform}-${donation.timestamp}`,
			platform: donation.platform,
			timestamp: donation.timestamp,
			files: donation.files.map((file) => ({
				name: file
			}))
		}));
		this.status = 'idle';
	}
}

class DataDonationApi {
	donors = $state<Donor[]>([]);
	status = $state<'idle' | 'loading' | 'error'>('idle');

	async fetch() {
		this.status = 'loading';
		const { data, error } = await client.GET('/donations/users', {
			headers: auth.headers
		});

		if (error) {
			this.status = 'error';
			throw new Error(`Failed to fetch users: ${error}`);
		}

		this.donors = data.users?.map((id) => new Donor(id)) || [];
		this.status = 'idle';
		for (const donor of this.donors) {
			await donor.getDonations();
		}
	}

	async asDownloadableDonation(donorId: string, donation: Donation): Promise<DownloadableDonation> {
		const results: DonationFile[] = await Promise.all(
			donation.files
				.map((file) => file.name)
				.map(async (fileName) => {
					const { data, error } = await client.GET(
						'/donations/{user_id}/{platform}/{timestamp}/{file_name}',
						{
							params: {
								path: {
									user_id: donorId,
									platform: donation.platform.replace('/', ''),
									timestamp: donation.timestamp.toString(),
									file_name: fileName
								}
							}
						}
					);
					if (error) {
						throw new Error(
							`Failed to fetch file ${fileName} for donation ${donation.timestamp} on platform ${donation.platform}: ${error}`
						);
					}
					return {
						name: fileName,
						content: data || {}
					};
				})
		);
		return new DownloadableDonation({
			...donation,
			files: results
		});
	}
}

export const dataDonationApi = new DataDonationApi();
