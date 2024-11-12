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
	let innerWidth = $state(window.innerWidth);
	let indexAxis = $derived(innerWidth > 640 ? 'x' : 'y') as 'x' | 'y';
	let valueAxis = $derived(innerWidth > 640 ? 'y' : 'x') as 'x' | 'y';
	let aspectRatio = $derived(innerWidth > 640 ? 2 : 0.5);

	const momentTimestamps = $derived(
		timestamps.map((tsNumber) => new Date(tsNumber)).map((ts) => moment(ts))
	);

	const bins = $derived.by(() => {
		const bins: { [key: string]: number } = {};
		momentTimestamps.forEach((ts) => {
			// Group every 2 hours
			const bin = ts.startOf('hour').format('YYYY-MM-DD HH:mm');
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
		const canvas = document.getElementById('myChart') as HTMLCanvasElement;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		new Chart(ctx, {
			type: 'bar',
			data: {
				labels: labels,
				datasets: [
					{
						label: 'Number of Ads',
						data: data,
						borderWidth: 1,
						barPercentage: 1,
						categoryPercentage: 1
					}
				]
			},
			options: {
				indexAxis: indexAxis,
				aspectRatio: aspectRatio,
				scales: {
					[indexAxis]: {
						type: 'time',
						time: {
							unit: 'day'
						},
						title: {
							display: true,
							text: 'Date'
						}
					},
					[valueAxis]: {
						beginAtZero: true
					}
				}
			}
		});
	});
</script>

<svelte:window bind:innerWidth />
<canvas id="myChart"></canvas>

<style>
	canvas {
		max-width: 100%;
		max-height: 80vh;
	}
</style>
