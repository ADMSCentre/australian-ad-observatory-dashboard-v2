<script lang="ts">
	import Dropdown from '$lib/components/dropdown/dropdown.svelte';
	import { VISUALISATION_TYPES } from 'mobile-observations/projects/types';

	let {
		selected = $bindable(),
		onSelected = null
	}: {
		selected: (typeof VISUALISATION_TYPES)[number] | null;
		onSelected?: ((value: (typeof VISUALISATION_TYPES)[number] | null) => void) | null;
	} = $props();

	const labels: Record<(typeof VISUALISATION_TYPES)[number], string> = {
		timeline: 'Timeline',
		'observer-table': 'Observer Table',
		'ads-browser': 'Ads Browser',
		raw: 'Raw JSON'
	};

	const options = Object.entries(labels)
		.map(([key, label]) => {
			return {
				value: key,
				label
			};
		})
		.concat({
			value: 'none',
			label: 'None'
		});

	function select(value: string) {
		if (value === 'none') {
			selected = null;
		} else {
			selected = value as (typeof VISUALISATION_TYPES)[number];
		}
		if (onSelected) {
			onSelected(selected);
		}
	}
</script>

<Dropdown {options} {selected} onSelected={select} placeholder="+ New visualisation..." />
