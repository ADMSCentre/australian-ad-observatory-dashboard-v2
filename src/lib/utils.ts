import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { base } from '$app/paths';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Combine the given path with the base path of the app (for deploying to a subdirectory).
 * @param path The path to combine with the base path.
 * @returns The combined path.
 */
export function withBase(path: string) {
	if (!path.startsWith('/')) {
		return `${base}/${path}`;
	}
	return `${base}${path}`;
}
