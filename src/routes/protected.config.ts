import { withBase } from '$lib/utils';

const protectedRoutes = [
	'/mobile-observations',
	// '/mobile-observations/observer',
	'/web-observations',
	'/users',
	'/users/self'
];

export const isRouteProtected = (path: string) => {
	const protectedRoutesWithBase = protectedRoutes.map(withBase);
	return protectedRoutesWithBase.includes(path);
};
