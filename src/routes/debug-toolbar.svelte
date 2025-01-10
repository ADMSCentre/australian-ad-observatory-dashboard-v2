<script lang="ts">
	import { pushToast } from '$lib/components/toasts/toasts.svelte';
	import { Button } from '$lib/components/ui/button';
	import { BugPlay, BugOff } from 'lucide-svelte';
	import { slide } from 'svelte/transition';

	let debug = $state({
		isOn: true
	});

	const toggleDebug = () => {
		debug.isOn = !debug.isOn;
	};
</script>

<div
	class="fixed bottom-0 left-1/2 flex flex-nowrap items-center rounded-md border bg-background text-foreground transition-all"
>
	<Button
		variant="ghost"
		size="icon"
		onclick={() => {
			toggleDebug();
		}}
	>
		{#if !debug.isOn}
			<BugPlay />
		{:else}
			<BugOff />
		{/if}
	</Button>
	{#if debug.isOn}
		<div class="flex flex-nowrap" transition:slide={{ axis: 'x' }}>
			<Button
				variant="link"
				size="sm"
				onclick={() => {
					// Random toast
					const type = ['info', 'success', 'warning', 'error'][Math.floor(Math.random() * 4)] as
						| 'info'
						| 'success'
						| 'warning'
						| 'error';
					pushToast({
						message: `This is a message with type: ${type}`,
						type: type
					});
				}}
			>
				Toast
			</Button>
		</div>
	{/if}
</div>
