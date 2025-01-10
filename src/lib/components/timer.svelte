<script lang="ts">
	import { onDestroy } from 'svelte';

	const {
		exp
	}: {
		exp: number;
	} = $props();

	let timeLeft = $state(exp - Date.now());
	const interval = setInterval(() => {
		timeLeft = exp - Date.now();
	}, 1000);

	onDestroy(() => {
		clearInterval(interval);
	});

	function formatTime(ms: number) {
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

<span>
	{formatTime(timeLeft)}
</span>
