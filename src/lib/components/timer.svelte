<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	const {
		exp,
		onExpire = () => {},
		class: className = ''
	}: {
		exp: number;
		onExpire?: () => void;
		class?: string;
	} = $props();

	let timeLeft = $state<number>();
	let interval: ReturnType<typeof setInterval>;

	$effect(() => {
		timeLeft = exp - Date.now();
		interval = setInterval(() => {
			if (timeLeft !== undefined && timeLeft <= 0) {
				clearInterval(interval);
				onExpire();
				return;
			}
			timeLeft = exp - Date.now();
		}, 1000);
	});

	onDestroy(() => {
		if (interval) clearInterval(interval);
	});

	function formatTime(ms: number) {
		if (ms <= 0) return '00:00:00';
		const totalSeconds = Math.floor(ms / 1000);
		const days = Math.floor(totalSeconds / (3600 * 24));
		const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		let formattedTime = '';
		if (days > 0) formattedTime += `${days} days `;
		formattedTime += `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

		return formattedTime;
	}
</script>

{#if timeLeft !== undefined}
	<span class={className}>
		{formatTime(timeLeft)}
	</span>
{/if}
