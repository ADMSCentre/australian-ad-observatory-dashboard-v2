import { withBase } from '$lib/utils';

const protectedRoutes: Record<
	string, {
		allowedRoles: ('user' | 'admin' | 'guest')[];
	}
> = {
	'/mobile-observations': {
		allowedRoles: ['user', 'admin']
	},
	'/web-observations': {
		allowedRoles: ['user', 'admin']
	},
	'/users': {
		allowedRoles: ['admin']
	},
	'/users/self': {
		allowedRoles: ['user', 'admin']
	},
	'/users/self/jwt': {
		allowedRoles: ['user', 'admin']
	},
	'/mobile-observations/query': {
		allowedRoles: ['user', 'admin']
	},
	'/mobile-observations/projects': {
		allowedRoles: ['user', 'admin']
	},
	'/mobile-observations/settings': {
		allowedRoles: ['user', 'admin']
	},
	'/data-download-packages': {
		allowedRoles: ['user', 'admin']
	},
	'/mobile-observations/hidden-ads': {
		allowedRoles: ['admin']
	}
}

export const canUserAccessRoute = (path: string, currentUserRole: 'user' | 'admin' | 'guest' = 'guest') => {
	const relativePath = withBase(path).replace(/\/+$/, ''); // Remove trailing slashes
	const routeConfig = protectedRoutes[relativePath];
	if (!routeConfig) {
		return false; // Route is not protected
	}
	return !routeConfig.allowedRoles.includes(currentUserRole);
};