import { auth } from '$lib/api/auth/auth.svelte';
import { type Project } from 'mobile-observations/projects/types';
import { PROJECTS } from './mock';

export class ProjectApiAdapter {
	private authHeader = $derived.by(() => {
		return { Authorization: `Bearer ${auth.token}` };
	});
	private projects = $state<Project[]>(PROJECTS);

	get all() {
		return this.projects;
	}

	get owned() {
		if (!auth.currentUser) return [];
		return this.projects.filter((p) => p.ownerId === auth.currentUser?.username);
	}

	get shared() {
		if (!auth.currentUser) return [];
		return this.projects.filter((p) => p.ownerId !== auth.currentUser?.username);
	}

	async fetchProjects() {
		if (!auth.token || !auth.currentUser) throw new Error('Not authenticated');
		// Should sync with the server - get all projects for the current user
		// return this.projects;
	}

	async createProject({ name, description = '' }: { name: string; description?: string }) {
		if (!auth.token || !auth.currentUser) throw new Error('Not authenticated');
		// TODO: Replace with actual API call
		const newProjectData: Project = {
			id: 'proj-' + Math.random().toString(36).substring(7),
			name,
			ownerId: auth.currentUser.username,
			description,
			team: [],
			cells: []
		};
		this.projects.push(newProjectData);
	}

	async updateProject(project: Project) {
		if (!auth.token || !auth.currentUser) throw new Error('Not authenticated');
		this.projects = this.projects.map((p) => (p.id === project.id ? project : p));
		console.log('Project update API called', project);
	}

	async deleteProject(projectId: string) {
		if (!auth.token || !auth.currentUser) throw new Error('Not authenticated');
		this.projects = this.projects.filter((p) => p.id !== projectId);
	}

	async get(projectId: string) {
		if (!auth.token || !auth.currentUser) throw new Error('Not authenticated');
		return this.projects.find((p) => p.id === projectId);
	}
}
