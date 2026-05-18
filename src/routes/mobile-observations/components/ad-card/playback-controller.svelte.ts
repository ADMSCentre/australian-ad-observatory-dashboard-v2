const PLAYBACK_FRAME_INTERVAL_MS = 800;

export class PlaybackController {
	#currentFrame = $state(0);
	isPlaying = $state(false);
	isHovering = $state(false);
	isDragging = $state(false);
	hasPlayed = $state(false);
	frameLoaded = $state(true);

	private timeoutId: ReturnType<typeof setTimeout> | null = null;
	private readonly getFrameCount: () => number;
	private readonly getExternalCurrentFrame?: () => number;
	private readonly setExternalCurrentFrame?: (frame: number) => void;

	constructor(
		getFrameCount: () => number,
		options?: {
			getCurrentFrame?: () => number;
			setCurrentFrame?: (frame: number) => void;
		}
	) {
		this.getFrameCount = getFrameCount;
		this.getExternalCurrentFrame = options?.getCurrentFrame;
		this.setExternalCurrentFrame = options?.setCurrentFrame;
	}

	get frameCount(): number {
		return this.getFrameCount();
	}

	get currentFrame(): number {
		return this.getExternalCurrentFrame ? this.getExternalCurrentFrame() : this.#currentFrame;
	}

	get progress(): number {
		const count = this.frameCount;
		return count > 1 ? this.currentFrame / (count - 1) : 0;
	}

	get isAtEnd(): boolean {
		return this.currentFrame >= this.frameCount - 1;
	}

	play() {
		if (this.frameCount <= 1) return;
		if (this.isAtEnd) {
			this.setFrame(0);
		}
		this.isPlaying = true;
		this.hasPlayed = true;
		this.frameLoaded = true;
		this.scheduleNextFrame();
	}

	stop() {
		this.isPlaying = false;
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
			this.timeoutId = null;
		}
	}

	toggle() {
		if (this.isPlaying) {
			this.stop();
		} else {
			this.play();
		}
	}

	handleFrameLoad() {
		this.frameLoaded = true;
		if (this.isPlaying) {
			this.scheduleNextFrame();
		}
	}

	reset() {
		this.stop();
		this.setFrame(0);
		this.isPlaying = false;
		this.isHovering = false;
		this.isDragging = false;
		this.hasPlayed = false;
		this.frameLoaded = true;
	}

	handleScrubStart(event: PointerEvent) {
		if (this.frameCount <= 1) return;
		this.isDragging = true;
		this.stop();
		this.updateScrub(event);
		(event.target as HTMLElement).setPointerCapture(event.pointerId);
	}

	handleScrubMove(event: PointerEvent) {
		if (!this.isDragging) return;
		this.updateScrub(event);
	}

	moveToNextFrame() {
		if (this.currentFrame < this.frameCount - 1) {
			this.setFrame(this.currentFrame + 1);
		}
	}

	moveToPreviousFrame() {
		if (this.currentFrame > 0) {
			this.setFrame(this.currentFrame - 1);
		}
	}

	setCurrentFrame(frame: number) {
		const nextFrame = Math.max(0, Math.min(this.frameCount - 1, frame));
		this.stop();
		this.setFrame(nextFrame);
		this.frameLoaded = false;
	}

	handleScrubEnd() {
		this.isDragging = false;
		this.stop();
	}

	private setFrame(frame: number) {
		if (this.setExternalCurrentFrame) {
			this.setExternalCurrentFrame(frame);
			return;
		}

		this.#currentFrame = frame;
	}

	private scheduleNextFrame() {
		if (this.timeoutId) clearTimeout(this.timeoutId);

		this.timeoutId = setTimeout(() => {
			if (!this.isPlaying) return;

			if (this.currentFrame >= this.frameCount - 1) {
				this.stop();
				return;
			}

			this.frameLoaded = false;
			this.setFrame(this.currentFrame + 1);
		}, PLAYBACK_FRAME_INTERVAL_MS);
	}

	private updateScrub(event: PointerEvent) {
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const pct = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
		this.setFrame(Math.round(pct * (this.frameCount - 1)));
	}
}
