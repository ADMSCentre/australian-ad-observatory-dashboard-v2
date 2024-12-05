<script lang="ts">
	import { toasts } from './toasts.svelte';
	import Toast from './toast.svelte';
	import { flip } from 'svelte/animate';
</script>

<div class="fixed bottom-4 right-4 z-[1000] flex flex-col-reverse gap-2">
	{#each toasts.toasts as toast (toast.id)}
		<div animate:flip={{ duration: 300 }}>
			<Toast {toast} />
		</div>
	{/each}
</div>
