// Defines the modes for different query methods in the mobile observations
// query system.
// This will allow different input types for different query methods.
// An example is the `OBSERVER_ID_CONTAINS` query which allows selecting an
// observer from a list of observers.

import { CodeIcon, SquareChevronDownIcon, WorkflowIcon } from 'lucide-svelte';

type EditorMode = {
	type: string;
	label: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	icon: any;
	tooltip: string;
};

export const DEFAULT_EDITOR_MODES = [
	{
		type: 'visual',
		label: 'Visual',
		icon: WorkflowIcon,
		tooltip: 'Visual query builder'
	},
	{
		type: 'text',
		label: 'Text',
		icon: CodeIcon,
		tooltip: 'Text-based query editor'
	}
] as const;

export const QUERY_METHOD_MODE: Record<string, EditorMode> = {
	OBSERVER_ID_CONTAINS: {
		type: 'multi-select',
		label: 'Multi-select',
		icon: SquareChevronDownIcon,
		tooltip: 'Select multiple observers from a list'
	}
};

export class QueryModeSelector {
	private _availableModes: EditorMode[] = $state<EditorMode[]>([...DEFAULT_EDITOR_MODES]);
	private _currentMode: EditorMode = $state<EditorMode>(DEFAULT_EDITOR_MODES[0]);
	method = $state<string>();

	setMethod(method: string) {
		this.method = method;
		if (QUERY_METHOD_MODE[method]) {
			const mode = QUERY_METHOD_MODE[method];
			this._availableModes = [mode, ...DEFAULT_EDITOR_MODES];
			this.setMode(mode);
		} else {
			this._availableModes = [...DEFAULT_EDITOR_MODES];
			// If the current mode is no longer available, reset to the first default mode
			const currentModeAvailable = this._availableModes.some(
				(m) => m.type === this._currentMode.type
			);
			if (!currentModeAvailable) {
				this.setMode(DEFAULT_EDITOR_MODES[0]);
			}
		}
	}

	setMode(mode: EditorMode) {
		if (this._availableModes.some((m) => m.type === mode.type)) {
			this._currentMode = mode;
		} else {
			console.warn(`Mode ${mode.type} is not available`);
		}
	}

	get currentMode() {
		return this._currentMode;
	}

	get availableModes() {
		return this._availableModes;
	}
}
