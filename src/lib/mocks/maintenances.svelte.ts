export interface Maintenance {
	id: string;
	title: string;
	description: string;
	startDate: Date;
	endDate: Date;
	status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

const MAINTENANCES: Maintenance[] = [
	{
		id: 'maintenance-1',
		title: 'CILogon Integration Update',
		description:
			'Scheduled update to enable CILogon integration as an alternative login method. This will allow users to log in using their university credentials.',
		startDate: new Date('2025-07-23T14:00:00+10:00'),
		endDate: new Date('2025-07-23T16:00:00+10:00'),
		status: 'completed'
	}
];

export class MaintenancesRepository {
	private _items = $state<Maintenance[]>(MAINTENANCES);
	private _loading = $state<boolean>(false);
	private _error = $state<string | null>(null);

	async fetch() {
		this._loading = true;
		try {
			// Simulate fetching from an API
			this._items = MAINTENANCES;
			this._error = null;
		} catch (error) {
			this._error = error instanceof Error ? error.message : 'Unknown error';
		} finally {
			this._loading = false;
		}
	}

	get items() {
		return this._items;
	}
	get loading() {
		return this._loading;
	}
	get error() {
		return this._error;
	}

	get isEmpty() {
		return this._items.length === 0;
	}
	get first() {
		return this._items[0];
	}
	get last() {
		return this._items[this._items.length - 1];
	}

	get count() {
		return this._items.length;
	}

	find(fn: (item: Maintenance) => boolean): Maintenance | undefined {
		return this._items.find(fn);
	}
	filter(fn: (item: Maintenance) => boolean): Maintenance[] {
		return this._items.filter(fn);
	}
	map<T>(fn: (item: Maintenance) => T): T[] {
		return this._items.map(fn);
	}
	async add(item: Maintenance) {
		this._items = [...this._items, item];
	}
	async update(item: Maintenance) {
		this._items = this._items.map((m) => (m.id === item.id ? item : m));
	}
	async remove(item: Maintenance) {
		this._items = this._items.filter((m) => m.id !== item.id);
	}
}
