import { withBase } from '$lib/utils';

const protectedRoutes = [
	'/mobile-observations',
	'/web-observations',
	'/users',
	'/users/self',
	'/mobile-observations/query',
	'/mobile-observations/projects',
	'/mobile-observations/settings',
	'/data-download-packages'
];

export const isRouteProtected = (path: string) => {
	const protectedRoutesWithBase = protectedRoutes.map(withBase);
	return protectedRoutesWithBase.includes(path);
};
