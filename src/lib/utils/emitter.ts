export class Emitter<T extends string> {
	private listeners: Record<T, Array<(...args: never[]) => void>> = {} as Record<
		T,
		Array<(...args: never[]) => void>
	>;

	on(event: T, listener: (...args: never[]) => void): void {
		if (!this.listeners[event]) {
			this.listeners[event] = [];
		}
		this.listeners[event].push(listener);
	}

	off(event: T, listener: (...args: never[]) => void): void {
		if (!this.listeners[event]) return;
		this.listeners[event] = this.listeners[event].filter((l) => l !== listener);
	}

	emit(event: T, ...args: never[]): void {
		if (!this.listeners[event]) return;
		this.listeners[event].forEach((listener) => listener(...args));
	}
}
