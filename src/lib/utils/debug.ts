export class Timer {
	private startTime: number = 0;
	private label: string = 'Timer';

	start(label: string) {
		this.label = label;
		this.startTime = performance.now();
		console.log(`${this.label} started...`);
	}

	stop() {
		const endTime = performance.now();
		const duration = endTime - this.startTime;
		console.log(`${this.label} took ${duration.toFixed(2)} ms`);
	}
}
