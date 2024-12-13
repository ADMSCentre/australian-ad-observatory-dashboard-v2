export const theme = $state<{
	mode: 'light' | 'dark';
	colors: {
		foreground: string;
		background: string;
	};
}>({
	mode: 'light',
	colors: {
		get foreground(): string {
			return theme.mode === 'light' ? 'black' : 'white';
		},
		get background(): string {
			return theme.mode === 'light' ? 'white' : 'black';
		}
	}
});

export const toggleLightMode = () => {
	theme.mode = theme.mode === 'light' ? 'dark' : 'light';
	setPreferredTheme();
};

// On start, get the user's preferred theme from local storage
const loadPreferredTheme = () => {
	const preferredTheme = localStorage.getItem('theme');
	if (preferredTheme) {
		theme.mode = preferredTheme as 'light' | 'dark';
	}
};

const setPreferredTheme = () => {
	localStorage.setItem('theme', theme.mode);
};

loadPreferredTheme();
