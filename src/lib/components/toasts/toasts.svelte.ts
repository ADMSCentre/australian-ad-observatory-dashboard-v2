export type Toast = {
	id: number;
	message: string;
	type: 'info' | 'success' | 'warning' | 'error' | 'default';
	timeout?: number;
};

export const toasts = $state<{
	toasts: Toast[];
}>({
	toasts: []
});

export const pushToast = (toast: Omit<Toast, 'id'>) => {
	console.log(toasts.toasts);
	const newToast = { ...toast, id: Date.now() };
	toasts.toasts = [...toasts.toasts, { ...toast, id: Date.now() }];
	if (toast.timeout) {
		setTimeout(() => {
			removeToast(newToast);
		}, toast.timeout);
	}
};

export const removeToast = (toast: Toast | number) => {
	const id = typeof toast === 'number' ? toast : toast.id;
	toasts.toasts = toasts.toasts.filter((t) => t.id !== id);
};
