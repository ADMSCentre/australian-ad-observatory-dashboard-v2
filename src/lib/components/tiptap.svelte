<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import StarterKit from '@tiptap/starter-kit';
	import Placeholder from '@tiptap/extension-placeholder';
	import Link from '@tiptap/extension-link';
	import { twMerge } from 'tailwind-merge';
	import Underline from '@tiptap/extension-underline';
	import { createEditor, Editor, EditorContent, BubbleMenu } from 'svelte-tiptap';
	import type { Readable } from 'svelte/store';
	import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';
	import {
		Bold,
		Heading1,
		Heading2,
		Heading3,
		Heading4,
		Italic,
		List,
		ListOrdered,
		Strikethrough,
		UnderlineIcon
	} from 'lucide-svelte';

	let editor = $state() as Readable<Editor>;
	let isLoading = $state(true);

	let {
		value = $bindable(),
		placeholder = 'Enter text...',
		class: className = '',
		disabled = false,
		menus = { bubble: true, floating: true, toolbar: true },
		oninput = () => {},
		inputDebounceAmount = 500,
		editorClasses = ''
	}: {
		value?: string;
		placeholder?: string;
		class?: string;
		editorClasses?: string;
		disabled?: boolean;
		menus?: {
			bubble?: boolean;
			floating?: boolean;
			toolbar?: boolean;
		};
		oninput?: (text: string) => void;
		inputDebounceAmount?: number;
	} = $props();

	const debounced = (fn: (value: string) => void, delay: number) => {
		let timeoutId: ReturnType<typeof setTimeout>;
		return (value: string) => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				fn(value);
			}, delay);
		};
	};
	let oninputDebounced = $derived(debounced((text: string) => oninput(text), inputDebounceAmount));

	onMount(() => {
		editor = createEditor({
			extensions: [
				StarterKit,
				Placeholder.configure({
					placeholder: placeholder
				}),
				Link.configure({
					openOnClick: true,
					linkOnPaste: true,
					autolink: true
				}),
				Underline
			],
			editorProps: {
				attributes: {
					class: 'flex-1 h-full'
				}
			},
			parseOptions: {
				preserveWhitespace: 'full'
			},
			content: value,
			onTransaction: () => {
				if (!$editor || isLoading) return;
			},
			onUpdate: ({ editor }) => {
				editor.getHTML();
				value = editor.getHTML() ?? '';
				oninputDebounced(value);
			}
		});
		isLoading = false;
	});

	onDestroy(() => {
		if ($editor) {
			$editor.destroy();
		}
	});

	type GroupMode = 'multiple' | 'single'; // multiple: multiple items can be selected, single: only one item of the group can be selected

	const formatGroups: {
		groupMode: GroupMode;
		formats: {
			name: string;
			icon: any;
			label: string;
			commands: {
				set: () => void | boolean;
				unset: () => void | boolean;
			};
			isActive: () => boolean;
		}[];
	}[] = $derived([
		{
			groupMode: 'multiple',
			formats: [
				{
					name: 'bold',
					icon: Bold,
					label: 'Toggle bold',
					commands: {
						set: () => $editor.chain().focus().setBold().run(),
						unset: () => $editor.chain().focus().unsetBold().run()
					},
					isActive: () => $editor.isActive('bold')
				},
				{
					name: 'italic',
					icon: Italic,
					label: 'Toggle italic',
					commands: {
						set: () => $editor.chain().focus().setItalic().run(),
						unset: () => $editor.chain().focus().unsetItalic().run()
					},
					isActive: () => $editor.isActive('italic')
				},
				{
					name: 'underline',
					icon: UnderlineIcon,
					label: 'Toggle underline',
					commands: {
						set: () => $editor.chain().focus().setUnderline().run(),
						unset: () => $editor.chain().focus().unsetUnderline().run()
					},
					isActive: () => $editor.isActive('underline')
				}
			]
		},
		{
			groupMode: 'single',
			formats: [
				{
					name: 'bulletList',
					icon: List,
					label: 'Toggle bullet list',
					commands: {
						set: () =>
							!$editor.isActive('bulletList') && $editor.chain().focus().toggleBulletList().run(),
						unset: () =>
							$editor.isActive('bulletList') && $editor.chain().focus().toggleBulletList().run()
					},
					isActive: () => $editor.isActive('bulletList')
				},
				{
					name: 'orderedList',
					icon: ListOrdered,
					label: 'Toggle ordered list',
					commands: {
						set: () =>
							!$editor.isActive('orderedList') && $editor.chain().focus().toggleOrderedList().run(),
						unset: () =>
							$editor.isActive('orderedList') && $editor.chain().focus().toggleOrderedList().run()
					},
					isActive: () => $editor.isActive('orderedList')
				}
			]
		},
		{
			groupMode: 'single',
			formats: [
				...[
					{
						level: 1,
						icon: Heading1
					},
					{
						level: 2,
						icon: Heading2
					},
					{
						level: 3,
						icon: Heading3
					},
					{
						level: 4,
						icon: Heading4
					}
				].map(({ level, icon }: { level: any; icon: any }) => {
					return {
						name: `heading${level}`,
						icon,
						label: `Toggle heading ${level}`,
						commands: {
							set: () =>
								!$editor.isActive('heading', { level }) &&
								$editor.chain().focus().toggleHeading({ level }).run(),
							unset: () =>
								$editor.isActive('heading', { level }) &&
								$editor.chain().focus().toggleHeading({ level }).run()
						},
						isActive: () => $editor.isActive('heading', { level })
					};
				})
			]
		}
	]);

	const toggleFormats = (values: string[]) => {
		formatGroups.forEach((group) => {
			const mode = group.groupMode;
			// If mode is single, only one item can be selected
			if (mode === 'single') {
				// Start by unsetting other formats in the group
				group.formats.forEach((format) => {
					if (!values.includes(format.name)) {
						format.commands.unset();
					}
				});
				// Then set the format that was clicked (should be the last)
				const last = values[values.length - 1];
				const format = group.formats.find((f) => f.name === last);
				if (format) {
					format.commands.set();
				}
			}
			// If mode is multiple, simply set or unset the format
			if (mode === 'multiple') {
				group.formats.forEach((format) => {
					const action = values.includes(format.name) ? format.commands.set : format.commands.unset;
					action();
				});
			}
		});
	};

	// Debounce the focus state to prevent the menu from flickering
	let isFocused = $state(false);
	let focusTimeout = $state<ReturnType<typeof setTimeout>>();

	$effect(() => {
		const stopDebounce = () => {
			clearTimeout(focusTimeout);
			isFocused = $editor.isFocused;
		};
		const startDebounce = () => {
			focusTimeout = setTimeout(() => {
				isFocused = $editor.isFocused;
			}, 100); // Adjust the debounce time as needed
		};
		if ($editor.isFocused) {
			stopDebounce();
		} else {
			startDebounce();
		}
	});
</script>

<div
	class={twMerge(
		'relative flex size-full flex-col rounded-xl border border-border bg-card text-sm shadow-none transition-colors duration-200 focus-within:border-amber-300',
		className
	)}
>
	{#if $editor && !disabled}
		<EditorContent
			editor={$editor}
			class={twMerge('box-border h-full flex-1 overflow-y-auto p-3', editorClasses)}
		/>
		{#if menus.toolbar}
			<ToggleGroup.Root
				type="multiple"
				class={twMerge(
					'absolute left-3 top-0 flex w-fit -translate-y-1/2 flex-wrap justify-start gap-1 rounded-lg border border-border bg-background p-1 shadow-sm',
					!isFocused && 'pointer-events-none invisible'
				)}
				value={formatGroups.flatMap((group) =>
					group.formats.filter((format) => format.isActive()).map((format) => format.name)
				)}
				onValueChange={toggleFormats}
			>
				{#each formatGroups as group (group.formats.map((format) => format.name).join('-'))}
					{#each group.formats as format (format.name)}
						<ToggleGroup.Item
							value={format.name}
							aria-label={format.label}
							class="!inline !size-7 min-w-0 flex-grow-0 !p-1 text-muted-foreground data-[state=on]:text-foreground"
						>
							<format.icon class="size-4" />
						</ToggleGroup.Item>
					{/each}
				{/each}
			</ToggleGroup.Root>
		{/if}
		{#if menus.bubble}
			<BubbleMenu editor={$editor} tippyOptions={{ duration: 100 }}>
				<ToggleGroup.Root
					type="multiple"
					class="bubble-menu flex gap-1 rounded-lg border border-border bg-background p-1 shadow-sm"
					value={formatGroups.flatMap((group) =>
						group.formats.filter((format) => format.isActive()).map((format) => format.name)
					)}
					onValueChange={toggleFormats}
				>
					{#each formatGroups as group (group.formats.map((format) => format.name).join('-'))}
						{#each group.formats as format (format.name)}
							<ToggleGroup.Item
								value={format.name}
								aria-label={format.label}
								class="size-7 p-1 text-muted-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
							>
								<format.icon class="size-4" />
							</ToggleGroup.Item>
						{/each}
					{/each}
				</ToggleGroup.Root>
			</BubbleMenu>
		{/if}
	{/if}

	{#if disabled}
		<div
			class={twMerge(
				'rendered-text box-border h-full flex-1 overflow-y-auto p-3 text-sm leading-6',
				editorClasses
			)}
		>
			{@html value}
		</div>
	{/if}
</div>

<style>
	:global(.rendered-text p:empty::before) {
		content: ' ';
		white-space: pre;
	}

	:global(.ProseMirror p.is-editor-empty:first-child::before) {
		content: attr(data-placeholder);
		float: left;
		color: #adb5bd;
		pointer-events: none;
		height: 0;
	}

	:global(.ProseMirror) {
		position: relative;
		width: 100%;
		height: 100%;
		user-select: none;
		background: hsl(var(--background));
		color: hsl(var(--foreground));
		font-size: 0.875rem;
		line-height: 1.5rem;
	}

	:global(.ProseMirror:focus) {
		outline: none;
	}

	:global(.ProseMirror ul) {
		margin: 0.5rem 0;
		list-style: disc;
		padding-left: 1.5rem;
	}

	:global(.ProseMirror ol) {
		margin: 0.5rem 0;
		list-style: decimal;
		padding-left: 1.5rem;
	}

	:global(.ProseMirror p) {
		margin: 0.25rem 0;
	}

	:global(.ProseMirror h1) {
		font-size: 1.25rem;
		font-weight: 600;
		letter-spacing: 0;
	}

	:global(.ProseMirror h2) {
		font-size: 1.125rem;
		font-weight: 600;
		letter-spacing: 0;
	}

	:global(.ProseMirror h3),
	:global(.ProseMirror h4) {
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: 0;
	}
</style>
