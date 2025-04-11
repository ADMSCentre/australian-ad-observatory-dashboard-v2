import { auth } from '$lib/api/auth/auth.svelte';
import { type Project } from 'mobile-observations/projects/types';
// import { PROJECTS } from './mock';
import { client } from '$lib/api/client';

export class ProjectApiAdapter {
	private authHeader = $derived.by(() => {
		return { Authorization: `Bearer ${auth.token}` };
	});
	private projects = $state<Project[]>([]);

	get all() {
		return this.projects;
	}

	get owned() {
		if (!auth.currentUser) return [];
		return this.projects.filter((p) => p.ownerId === auth.currentUser?.username);
	}

	get shared() {
		if (!auth.currentUser) return [];
		return this.projects.filter(
			(p) =>
				p.team.some((u) => u.username === auth.currentUser?.username) &&
				p.ownerId !== auth.currentUser?.username
		);
	}

	get other() {
		if (!auth.currentUser) return [];
		return this.projects.filter(
			(p) =>
				p.ownerId !== auth.currentUser?.username &&
				!p.team.some((u) => u.username === auth.currentUser?.username)
		);
	}

	async fetch() {
		if (!auth.token || !auth.currentUser) throw new Error('Not authenticated');
		// Should sync with the server - get all projects for the current user
		// return this.projects;
		const { data, error } = await client.GET('/projects', { headers: this.authHeader });
		if (error) throw new Error(error);
		this.projects = data as Project[];
	}

	async create({ name, description = '' }: { name: string; description?: string }) {
		if (!auth.token || !auth.currentUser) throw new Error('Not authenticated');
		// TODO: Replace with actual API call
		// const newProjectData: Project = {
		// 	id: 'project-' + Math.random().toString(36).substring(7),
		// 	name,
		// 	ownerId: auth.currentUser.username,
		// 	description,
		// 	team: [],
		// 	cells: []
		// };
		const { error } = await client.POST('/projects', {
			headers: this.authHeader,
			body: {
				name,
				description
			}
		});
		if (error) throw new Error(error);
		await this.fetch();
		// this.projects.push(newProjectData);
	}

	async updateProject(project: Project) {
		if (!auth.token || !auth.currentUser) throw new Error('Not authenticated');
		// this.projects = this.projects.map((p) => (p.id === project.id ? project : p));
		console.log('Project update API called', project);
		const { error } = await client.PUT('/projects/{project_id}', {
			headers: this.authHeader,
			params: {
				path: {
					project_id: project.id
				}
			},
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			body: project as any
		});
		if (error) throw new Error(error);
		await this.fetch();
	}

	async deleteProject(projectId: string) {
		if (!auth.token || !auth.currentUser) throw new Error('Not authenticated');
		// this.projects = this.projects.filter((p) => p.id !== projectId);
		const { error } = await client.DELETE('/projects/{project_id}', {
			headers: this.authHeader,
			params: {
				path: {
					project_id: projectId
				}
			}
		});
		if (error) throw new Error(error);
		await this.fetch();
	}

	async get(projectId: string) {
		if (!auth.token || !auth.currentUser) throw new Error('Not authenticated');
		const proj = this.projects.find((p) => p.id === projectId);
		if (!proj) await this.fetch();
		return this.projects.find((p) => p.id === projectId);
	}
}
