<script lang="ts">
	import { onDestroy } from 'svelte';

	const {
		exp,
		onExpire = () => {},
		class: className = ''
	}: {
		exp: number;
		onExpire?: () => void;
		class?: string;
	} = $props();

	let timeLeft = $state(exp - Date.now());
	const interval = setInterval(() => {
		if (timeLeft <= 0) {
			clearInterval(interval);
			onExpire();
			return;
		}
		timeLeft = exp - Date.now();
	}, 1000);

	onDestroy(() => {
		clearInterval(interval);
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

<span class={className}>
	{formatTime(timeLeft)}
</span>
