import { auth } from '$lib/api/auth/auth.svelte';
import { session } from '$lib/api/session/session.svelte';
import type { Cell, Project } from './types';

export class ProjectManager {
	project = $state<Project>();
	queryResults = $state<{
		[cellId: string]: {
			loading: boolean;
			response?: Awaited<ReturnType<typeof session.ads.query>>;
		};
	}>({});

	get currentUser() {
		const user = this.project?.team.find((m) => m.username === auth.currentUser?.username) ?? null;
		const isOwner = user?.username === this.project?.ownerId;
		return {
			isOwner,
			get isAdmin() {
				return user?.role === 'admin';
			},
			get isEditor() {
				return user?.role === 'editor' || this.isAdmin;
			},
			get isViewer() {
				return user?.role === 'viewer' || this.isEditor || this.isAdmin;
			}
		};
	}

	constructor(project: Project) {
		this.project = project;
	}

	async update() {
		if (!this.project) {
			throw new Error('Project not found');
		}
		await session.projects.updateProject(this.project);
	}

	async runAllCells() {
		if (!this.project) {
			return;
		}
		const promises = this.project.cells
			.filter((cell) => cell.type === 'query')
			.map((cell) => this.runCell(cell.id));
		await Promise.all(promises);
		// for (const cell of this.project.cells) {
		// 	if (cell.type === 'query') {
		// 		await this.runCell(cell.id);
		// 	}
		// }
	}

	async runCell(cellId: string) {
		const cell = this.getCell(cellId);
		if (cell?.type !== 'query') throw new Error('Cell is not runnable');
		if (!cell) throw new Error('Cell not found');
		// Create the queryResults if not exists
		this.queryResults[cell.id] = {
			loading: true
		};
		const results = await session.ads.query(cell.content.query);
		this.queryResults[cell.id] = {
			loading: false,
			response: results
		};
	}

	insertCell(cell: Cell, index: number) {
		if (!this.project) {
			throw new Error('Project not found');
		}
		this.project.cells.splice(index, 0, cell);
	}

	appendCell(cell: Cell) {
		if (!this.project) {
			throw new Error('Project not found');
		}
		this.project.cells.push(cell);
	}

	popCell(cellId: string) {
		if (!this.project) {
			throw new Error('Project not found');
		}
		const target = this.project.cells.find((cell) => cell.id === cellId);
		this.project.cells = this.project.cells.filter((cell) => cell.id !== cellId);
		return target;
	}

	getCell(cellId: string) {
		if (!this.project) {
			throw new Error('Project not found');
		}
		return this.project.cells.find((cell) => cell.id === cellId);
	}

	shiftCellUp(cellId: string) {
		if (!this.project) {
			throw new Error('Project not found');
		}
		const index = this.project.cells.findIndex((cell) => cell.id === cellId);
		if (index === -1) {
			throw new Error('Cell not found');
		}
		// Do nothing if the cell is already at the top
		if (index === 0) {
			return;
		}
		const cell = this.project.cells[index];
		this.project.cells.splice(index, 1);
		this.project.cells.splice(index - 1, 0, cell);
	}

	shiftCellDown(cellId: string) {
		if (!this.project) {
			throw new Error('Project not found');
		}
		const index = this.project.cells.findIndex((cell) => cell.id === cellId);
		if (index === -1) {
			throw new Error('Cell not found');
		}
		// Do nothing if the cell is already at the bottom
		if (index === this.project.cells.length - 1) {
			return;
		}
		const cell = this.project.cells[index];
		this.project.cells.splice(index, 1);
		this.project.cells.splice(index + 1, 0, cell);
	}
}

export const PROJECT_MANAGER = Symbol('CellManager');
