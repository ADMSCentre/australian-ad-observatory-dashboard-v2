export const debug = $state<{
	enabled: boolean;
}>({
	enabled: false
});

debug.enabled = process.env.NODE_ENV === 'development';
