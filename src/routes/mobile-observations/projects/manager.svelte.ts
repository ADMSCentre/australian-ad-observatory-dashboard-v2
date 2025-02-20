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

	constructor(project: Project) {
		this.project = project;
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
