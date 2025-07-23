import { auth } from '$lib/api/auth/auth.svelte';
import type { QueryState } from '$lib/api/session/query/index.svelte';
import { session } from '$lib/api/session/session.svelte';
import type { Cell, Project } from './types';

export class ProjectManager {
	project = $state<Project>();
	queryResults = $state<{
		[cellId: string]: {
			loading: boolean;
			error: boolean;
			aborted?: boolean;
			message?: string;
			response?: QueryState;
		};
	}>({});

	get currentUser() {
		const authenticatedUser = session.users.all.find((u) => u.id === auth.currentUser?.sub);
		const user = this.project?.team.find((m) => m.username === authenticatedUser?.username) ?? null;
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
		const queryCells = this.project.cells.filter((cell) => cell.type === 'query');

		// Mark all query results as loading
		for (const cell of queryCells) {
			this.queryResults[cell.id] = {
				...this.queryResults[cell.id],
				loading: true,
				error: false
			};
		}

		// Asynchronous execution
		// await Promise.all(queryCells.map(c => this.runCell(c.id)));

		// Sequential execution
		for (const cell of queryCells) await this.runCell(cell.id);
	}

	abortAllCells() {
		if (!this.project) {
			return;
		}
		const queryCells = this.project.cells.filter((cell) => cell.type === 'query');
		for (const cell of queryCells) {
			this.abortCell(cell.id);
		}
	}

	abortCell(cellId: string) {
		const cell = this.getCell(cellId);
		if (cell?.type !== 'query') throw new Error('Cell is not abortable');
		if (!cell) throw new Error('Cell not found');
		const response = this.queryResults[cell.id]?.response;
		if (response && response.running) {
			response.abort();
		}
		this.queryResults[cell.id] = {
			loading: false,
			error: false,
			aborted: true
		};
	}

	async runCell(cellId: string) {
		if (this.queryResults[cellId]?.aborted) return;
		const cell = this.getCell(cellId);
		if (cell?.type !== 'query') throw new Error('Cell is not runnable');
		if (!cell) throw new Error('Cell not found');
		// Create the queryResults if not exists
		this.queryResults[cell.id] = {
			loading: true,
			error: false
		};
		try {
			const response = session.query.prepare(cell.content.query, true);
			this.queryResults[cell.id] = {
				get loading() {
					return response.running;
				},
				error: false,
				response: response
			};
			await response.fetch();
		} catch (e) {
			this.queryResults[cell.id] = {
				loading: false,
				error: true,
				message:
					'An error has occured: ' +
					(e instanceof Error ? e.message : JSON.stringify(e, null, 2)) +
					'. Try running the query again. If the error persists, please contact support.'
			};
		}
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
		console.log('Popping cell', cellId);
		const target = this.project.cells.find((cell) => cell.id === cellId);
		// Abort the cell if it is a query
		if (target?.type === 'query') {
			this.abortCell(target.id);
		}
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
