<script lang="ts">
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { InfoIcon } from 'lucide-svelte';
	import { twMerge } from 'tailwind-merge';
	import Button from './ui/button/button.svelte';
	import { auth } from '$lib/api/auth/auth.svelte';

	const { class: className = '' }: { class?: string } = $props();
</script>

<Alert.Root
	variant="info"
	class={twMerge('rounded-xl border-info/20 bg-info/5 text-sm leading-6 shadow-none', className)}
>
	<Alert.Title class="flex items-center justify-between gap-3 text-lg font-semibold text-primary">
		Pending Account Approval
		<InfoIcon class="size-5 shrink-0 text-info" />
	</Alert.Title>
	<div class="mt-3 flex flex-col gap-3 text-muted-foreground">
		<p>Thank you for your interest in the Australian Ad Observatory Dashboard.</p>
		<p>
			You are logged in successfully, but your account is not approved. We are currently reviewing
			your account. Please <Button
				class="inline size-fit p-0 text-sm font-medium"
				variant="link"
				onclick={() => auth.logout()}>log out</Button
			>
			and check back later.
		</p>
	</div>
</Alert.Root>
