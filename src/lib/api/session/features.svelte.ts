type Feature = {
	id: string;
	name: string;
	description: string;
	enabled: boolean;
};

const FEATURES = [
	{
		id: 'cilogon',
		name: 'CILogon Authentication',
		description: 'Allows users to authenticate using CILogon, a federated identity service.',
		enabled: true
	}
] satisfies Feature[];

export type FeatureId = 'cilogon';

class FeatureFlags {
	private features = $state<Record<string, Feature>>({});
	private isOverridden = $state(false);

	constructor() {
		FEATURES.forEach((feature) => {
			this.features[feature.id] = feature;
		});
		// Check localStorage.overrideFeatureFlags
		const override = localStorage.getItem('overrideFeatureFlags');
		if (override) {
			try {
				const parsed = JSON.parse(override);
				if (typeof parsed === 'boolean') {
					this.isOverridden = parsed;
				}
			} catch (e) {
				console.error('Failed to parse overrideFeatureFlags from localStorage', e);
			}
		}
	}

	get all() {
		return Object.values(this.features);
	}

	get(id: FeatureId): Feature | null {
		return this.features[id] || null;
	}

	isEnabled(id: FeatureId): boolean {
		if (this.isOverridden) {
			return true;
		}
		return this.features[id]?.enabled ?? false;
	}

	toggle(id: FeatureId) {
		if (this.features[id]) {
			this.features[id].enabled = !this.features[id].enabled;
		}
	}
}

export const featureFlags = new FeatureFlags();
