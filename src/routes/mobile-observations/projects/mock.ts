import type { Project } from './types';

export const PROJECTS: Project[] = [
	{
		id: 'proj-abcd',
		name: 'Project ABCD',
		description: 'This is a project description',
		team: [
			{
				username: 'dantran',
				role: 'admin'
			},
			{
				username: 'user2',
				role: 'viewer'
			},
			{
				username: 'guest',
				role: 'viewer'
			}
		],
		cells: [
			{
				id: 'cell-1',
				type: 'text',
				content: 'This is a rich text cell'
			},
			{
				id: 'cell-2',
				type: 'query',
				content: {
					query: {
						method: 'AND',
						args: [
							{
								method: 'OBSERVER_ID_CONTAINS',
								args: ['5ea']
							},
							{
								method: 'OBSERVATION_ID_CONTAINS',
								args: ['abc']
							}
						]
					},
					results: [
						{
							id: 'result-0',
							type: 'raw'
						},
						{
							id: 'result-1',
							type: 'table'
						},
						{
							id: 'result-2',
							type: 'timeline'
						},
						{
							id: 'result-3',
							type: 'ads-browser',
							config: {
								sort: 'newest',
								groupBy: 'date'
							}
						}
					]
				}
			}
		]
	}
];
