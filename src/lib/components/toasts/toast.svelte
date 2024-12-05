<script lang="ts">
	import { CircleAlert, X } from 'lucide-svelte';
	import { type Toast, removeToast } from './toasts.svelte';
	import { scale } from 'svelte/transition';
	import Markdown from 'svelte-exmarkdown';

	const {
		toast
	}: {
		toast: Toast;
	} = $props();

	function closeToast() {
		removeToast(toast.id);
	}
</script>

<div
	transition:scale
	class={`toast toast--${toast.type} flex items-center gap-2 rounded-md p-4 shadow-lg`}
>
	<div class="toast__icon flex items-center justify-center">
		<CircleAlert></CircleAlert>
	</div>
	<div class="toast__content">
		<Markdown md={toast.message} />
	</div>
	<button class="toast__close ml-4" onclick={closeToast}>
		<X class="text-gray-500"></X>
	</button>
</div>

<style>
	.toast {
		@apply max-w-96 !bg-opacity-75 backdrop-blur;
	}
	.toast--info {
		@apply bg-blue-100 text-blue-700 [&>svg]:text-blue-700;
	}
	.toast--success {
		@apply bg-green-100 text-green-700 [&>svg]:text-green-700;
	}
	.toast--error {
		@apply bg-red-100 text-red-700 [&>svg]:text-red-700;
	}
	.toast__icon {
		width: 2rem;
		height: 2rem;
	}
	.toast__content {
		flex: 1;
	}
	.toast__close {
		background: none;
		border: none;
		cursor: pointer;
	}
</style>
