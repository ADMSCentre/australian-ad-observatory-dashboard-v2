<script lang="ts">
	import { onMount } from 'svelte';
	// import * as HoverCard from '$lib/components/ui/popover/index.js';
	import * as HoverCard from '$lib/components/ui/hover-card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { RefreshCcwIcon } from 'lucide-svelte';
	import { twMerge } from 'tailwind-merge';

	export interface ColorSelectorProps {
		hex: string;
		isValid: boolean;
		classes?: {
			randomizer?: string;
			raw?: string;
		};
	}

	let {
		hex = $bindable(),
		isValid = $bindable(),
		classes = {
			randomizer: '',
			raw: ''
		}
	}: ColorSelectorProps = $props();

	const colors = [
		'#E53935',
		'#FB8C00',
		'#FDD835',
		'#43A047',
		'#1E88E5',
		'#8E24AA',
		'#C62828',
		'#EF6C00',
		'#F9A825',
		'#2E7D32',
		'#1565C0',
		'#6A1B9A',
		'#B71C1C',
		'#D84315',
		'#F57F17',
		'#1B5E20',
		'#0D47A1',
		'#4A148C'
	];

	const selectColor = (color: string) => {
		hex = color;
	};

	const rgbToHsl = (r: number, g: number, b: number) => {
		r /= 255;
		g /= 255;
		b /= 255;
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		let h: number = 0,
			s: number = 0,
			l: number = (max + min) / 2;
		const d = max - min;
		if (d === 0) {
			h = s = 0; // achromatic
		} else {
			s = l < 0.5 ? d / (max + min) : d / (2 - max - min);
			switch (max) {
				case r:
					h = (g - b) / d + (g < b ? 6 : 0);
					break;
				case g:
					h = (b - r) / d + 2;
					break;
				case b:
					h = (r - g) / d + 4;
					break;
			}
			h /= 6;
		}
		return [h, s, l];
	};

	const rgbToHex = (r: number, g: number, b: number) => {
		const hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
		return `#${hex}`;
	};

	const randomizeColor = () => {
		// Create a random rgb color
		const randomColor = Math.floor(Math.random() * 16777215).toString(16);
		// Convert to rgb
		const r = parseInt(randomColor.slice(0, 2), 16);
		const g = parseInt(randomColor.slice(2, 4), 16);
		const b = parseInt(randomColor.slice(4, 6), 16);
		// Convert to hsl
		const [h, s, l] = rgbToHsl(r, g, b);
		// Try again if the luminance is too high (since label text is white)
		if (l > 0.75) {
			return randomizeColor();
		}
		// Convert back to hex
		const newHex = rgbToHex(r, g, b);
		hex = newHex;
	};

	$effect(() => {
		isValid = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
	});
</script>

<div class="flex w-fit items-center gap-2">
	<!-- Hex input text -->
	<HoverCard.Root openDelay={0} closeDelay={0}>
		<HoverCard.Trigger class="flex items-center gap-2 no-underline">
			<!-- Randomizer button -->
			<Button
				size="icon"
				onclick={randomizeColor}
				class={twMerge('aspect-square  text-white', classes.randomizer)}
				style="background-color: {hex}"
			>
				<RefreshCcwIcon />
			</Button>
			<!-- Color code -->
			<Input
				bind:value={hex}
				class={twMerge(!isValid && 'text-destructive', classes.raw)}
				placeholder="Enter hex"
				maxlength={7}
			/>
		</HoverCard.Trigger>
		<HoverCard.Content>
			<div class="flex w-full flex-col gap-2">
				<p class="text-sm text-muted-foreground">Choose from default colors</p>
				<div class="grid grid-cols-6 gap-x-4 gap-y-2 p-2">
					{#each colors as color}
						<Button
							size="icon"
							class="aspect-square !size-8 cursor-pointer rounded border-2 border-transparent hover:border-primary"
							style="background-color: {color}"
							onclick={() => selectColor(color)}
						></Button>
					{/each}
				</div>
			</div>
		</HoverCard.Content>
	</HoverCard.Root>
</div>
