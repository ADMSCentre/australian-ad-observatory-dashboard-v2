<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Chart from 'chart.js/auto';
	import moment from 'moment';
	import 'chartjs-adapter-moment';

	// Sample list of timestamps
	const {
		timestamps
	}: {
		timestamps: number[];
	} = $props();

	// Convert timestamps to moment objects
	const momentTimestamps = $derived(
		timestamps.map((tsNumber) => new Date(tsNumber)).map((ts) => moment(ts))
	);

	// Create bins of 30 minutes
	// const bins = {};
	// momentTimestamps.forEach((ts) => {
	// 	const bin = ts
	// 		.startOf('hour')
	// 		.add(Math.floor(ts.minute() / 30) * 30, 'minutes')
	// 		.format('YYYY-MM-DD HH:mm');
	// 	bins[bin] = (bins[bin] || 0) + 1;
	// });

	const bins = $derived.by(() => {
		const bins = {};
		momentTimestamps.forEach((ts) => {
			const bin = ts
				.startOf('hour')
				.add(Math.floor(ts.minute() / 30) * 30, 'minutes')
				.format('YYYY-MM-DD HH:mm');
			bins[bin] = (bins[bin] || 0) + 1;
		});
		console.log('bins', bins);
		return bins;
	});

	// Prepare data for Chart.js
	const labels = $derived(Object.keys(bins));
	const data = $derived(Object.values(bins));

	$effect(() => {
		// Clear the chart before creating a new one
		let chartStatus = Chart.getChart('myChart'); // <canvas> id
		if (chartStatus != undefined) {
			chartStatus.destroy();
		}
		const ctx = document.getElementById('myChart').getContext('2d');
		if (!ctx) return;
		new Chart(ctx, {
			type: 'bar',
			data: {
				labels: labels,
				datasets: [
					{
						label: 'Number of Ads',
						data: data,
						backgroundColor: 'rgba(75, 192, 192, 0.2)',
						borderColor: 'rgba(75, 192, 192, 1)',
						borderWidth: 1
					}
				]
			},
			options: {
				scales: {
					x: {
						type: 'time',
						time: {
							unit: 'hour'
						}
					},
					y: {
						beginAtZero: true
					}
				}
			}
		});
	});
</script>

<canvas id="myChart" width="400" height="200"></canvas>

<style>
	canvas {
		max-width: 100%;
	}
</style>
