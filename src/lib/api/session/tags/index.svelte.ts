export interface Tag {
	id: string;
	name: string;
	description: string;
	hex: string;
}

export class TagApiAdapter {
	private data: Tag[] = $state([
		{
			id: '1',
			name: 'Backlog',
			description: "This item hasn't been started",
			hex: '#10B981'
		},
		{
			id: '2',
			name: 'In progress',
			description: 'This is actively being worked on',
			hex: '#FBBF24'
		},
		{
			id: '3',
			name: 'In review',
			description: 'This item is in review',
			hex: '#A78BFA'
		},
		{
			id: '4',
			name: 'Done',
			description: 'This has been completed',
			hex: '#FB923C'
		}
	]);

	get all(): Tag[] {
		return this.data;
	}

	/** Read a single tag by its ID */
	getById(id: string): Tag | undefined {
		return this.data.find((tag) => tag.id === id);
	}

	/** Create a new tag */
	async create(payload: Omit<Tag, 'id'>): Promise<Tag> {
		const newTag: Tag = {
			id: crypto.randomUUID(),
			...payload
		};
		this.data = [...this.data, newTag];
		return newTag;
	}

	/** Update an existing tag */
	async update(updated: Tag): Promise<Tag | undefined> {
		const idx = this.data.findIndex((tag) => tag.id === updated.id);
		if (idx === -1) return undefined;
		const newList = [...this.data];
		newList[idx] = updated;
		this.data = newList;
		return updated;
	}

	/** Delete a tag by its ID */
	async delete(id: string): Promise<boolean> {
		const before = this.data.length;
		this.data = this.data.filter((tag) => tag.id !== id);
		return this.data.length < before;
	}
}
