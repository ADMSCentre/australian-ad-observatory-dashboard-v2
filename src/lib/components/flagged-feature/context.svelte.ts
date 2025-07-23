import { featureFlags, type FeatureId } from '$lib/api/session/features.svelte';
import { getContext, setContext, type Snippet } from 'svelte';

class FlaggedFeatureContext {
	private featureId = $state<FeatureId | null>(null);
	alternative = $state<Snippet | null>(null);

	constructor(featureId?: FeatureId) {
		if (featureId) {
			this.featureId = featureId;
		}
	}

	get isEnabled() {
		if (!this.featureId) return false;
		return featureFlags.isEnabled(this.featureId);
	}

	get feature() {
		if (!this.featureId) return null;
		return featureFlags.get(this.featureId);
	}
}

const SYMBOL = Symbol('flaggedFeatureContext');

export function setFlaggedFeatureContext(featureId: FeatureId) {
	const context = new FlaggedFeatureContext(featureId);
	setContext(SYMBOL, context);
}

export function getFlaggedFeatureContext() {
	const context = getContext<FlaggedFeatureContext>(SYMBOL);
	if (!context) {
		throw new Error('FlaggedFeatureContext not set');
	}
	return context;
}
