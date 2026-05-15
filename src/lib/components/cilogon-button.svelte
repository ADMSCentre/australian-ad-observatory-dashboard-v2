<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { config } from '$lib/config';
	import type { Snippet } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	const API_BASE = config.apiUrls.mobileObservations;
	const CILOGON_URL = `${API_BASE}/auth/cilogon/login`;

	const { class: className = '', children }: { class?: string; children?: Snippet } = $props();
</script>

<Button class={twMerge('h-10 font-medium', className)} variant="outline" href={CILOGON_URL}>
	{@render children?.()}
</Button>
