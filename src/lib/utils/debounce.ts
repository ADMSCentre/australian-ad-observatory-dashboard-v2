// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const debounce = (fn: Function, delay: number) => {
	let timeout: NodeJS.Timeout;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (...args: any[]) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => fn(...args), delay);
	};
};
