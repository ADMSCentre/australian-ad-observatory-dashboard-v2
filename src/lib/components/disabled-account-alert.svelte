<script lang="ts">
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { InfoIcon } from 'lucide-svelte';
	import { twMerge } from 'tailwind-merge';
	import Button from './ui/button/button.svelte';
	import { auth } from '$lib/api/auth/auth.svelte';

	const { class: className = '' }: { class?: string } = $props();
</script>

<Alert.Root variant="info" class={twMerge(className)}>
	<Alert.Title class="flex items-center justify-between gap-2 text-lg">
		Pending Account Approval
		<InfoIcon />
	</Alert.Title>
	<div class="flex flex-col gap-4">
		<p>Thank you for your interest in the Australian Ad Observatory Dashboard.</p>
		<p>
			You are logged in successfully, but your account is not approved. We are currently reviewing
			your account. Please <Button
				class="inline size-fit p-0 text-base"
				variant="link"
				onclick={() => auth.logout()}>log out</Button
			>
			and check back later.
		</p>
	</div>
</Alert.Root>
