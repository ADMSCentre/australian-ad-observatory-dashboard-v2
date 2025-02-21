import { type Project } from 'mobile-observations/projects/types';

export const PROJECTS: Project[] = [
	{
		id: 'proj-fare-alchohol-study',
		name: '2024 FARE Study',
		ownerId: 'dantran',
		description: 'This project observes alcohol and gambling advertisements on Facebook',
		team: [
			{
				username: 'dantran',
				role: 'admin'
			}
		],
		cells: [
			{
				id: 'cell-1',
				type: 'text',
				content:
					'<h1>All Observations</h1><p>Below is the data of all participants restricted to the time range of the study.</p>'
			},
			{
				id: 'cell-2',
				type: 'query',
				content: {
					query: {
						method: 'AND',
						args: [
							{
								method: 'DATETIME_AFTER',
								args: ['1726408800000']
							},
							{
								method: 'DATETIME_BEFORE',
								args: ['1728223140000']
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
			},
			{
				id: 'cell-3',
				type: 'text',
				content:
					'<h1>Original Participants</h1><p>Below is the data for the 5 participants who participated in the pilot study and is coming back for this study.</p>'
			},
			{
				id: 'cell-4',
				type: 'query',
				content: {
					query: {
						method: 'AND',
						args: [
							{
								method: 'AND',
								args: [
									{
										method: 'DATETIME_AFTER',
										args: ['1726408800000']
									},
									{
										method: 'DATETIME_BEFORE',
										args: ['1728223140000']
									}
								]
							},
							{
								method: 'OBSERVER_ID_CONTAINS',
								args: ['3677b622', '5ea80108', 'f7440767', '7f7277ba', '471c82ad']
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
