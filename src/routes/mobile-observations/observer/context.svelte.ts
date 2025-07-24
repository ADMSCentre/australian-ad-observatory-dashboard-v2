import { getContext, setContext } from 'svelte';

class ObserverPageContext {
	private _observerId = $state<string>();

	constructor(observerId: string) {
		this._observerId = observerId;
	}

	get observerId(): string {
		if (!this._observerId) {
			throw new Error('Observer ID is not set');
		}
		return this._observerId;
	}
}

const SYMBOL = Symbol('ObserverPageContext');

export function setObserverPageContext(observerId: string): void {
	if (typeof observerId !== 'string' || !observerId.trim()) {
		throw new Error('Invalid observer ID');
	}
	const context = new ObserverPageContext(observerId);
	setContext(SYMBOL, context);
}

export function getObserverPageContext(): ObserverPageContext {
	const context = getContext<ObserverPageContext>(SYMBOL);
	if (!context) {
		throw new Error('ObserverPageContext not found');
	}
	return context;
}
