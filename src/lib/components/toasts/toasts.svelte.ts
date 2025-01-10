import { toast as createToast } from 'svelte-sonner';

export type Toast = {
	id: number;
	message: string;
	type: 'info' | 'success' | 'warning' | 'error' | 'default';
	timeout?: number;
};

export const pushToast = (toast: Omit<Toast, 'id'>) => {
	const create = toast.type === 'default' ? createToast : createToast[toast.type];
	create(toast.message, {
		duration: toast.timeout
	});
};
