<script lang="ts">
	import { onMount, onDestroy, type Component } from 'svelte';
	import StarterKit from '@tiptap/starter-kit';
	import Placeholder from '@tiptap/extension-placeholder';
	import Link from '@tiptap/extension-link';
	import BulletList from '@tiptap/extension-bullet-list';
	import OrderedList from '@tiptap/extension-ordered-list';
	import ListItem from '@tiptap/extension-list-item';
	import { twMerge } from 'tailwind-merge';
	import Underline from '@tiptap/extension-underline';
	import { createEditor, Editor, EditorContent, FloatingMenu, BubbleMenu } from 'svelte-tiptap';
	import type { Readable } from 'svelte/store';
	import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';
	import { Bold, Italic, List, ListOrdered, Strikethrough, UnderlineIcon } from 'lucide-svelte';

	let editor = $state() as Readable<Editor>;
	let isLoading = $state(true);

	let {
		value = $bindable(),
		placeholder = 'Enter text...',
		class: className = '',
		readonly = false,
		menus = { bubble: true, floating: true, toolbar: true },
		oninput = () => {}
	}: {
		value?: string;
		placeholder?: string;
		readonly?: boolean;
		class?: string;
		menus?: {
			bubble?: boolean;
			floating?: boolean;
			toolbar?: boolean;
		};
		oninput?: (text: string) => void;
	} = $props();

	onMount(() => {
		editor = createEditor({
			editable: !readonly,
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
			content: value,
			onTransaction: () => {
				if (!$editor || isLoading) return;
			},
			onUpdate: ({ editor }) => {
				editor.getHTML();
				value = editor.getHTML() ?? '';
				oninput(value);
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

<!-- <div class={twMerge('relative size-full rounded border p-2', className)} bind:this={element}></div> -->

<div class={twMerge('relative flex size-full flex-col rounded border', className)}>
	{#if $editor}
		<EditorContent editor={$editor} class="max-h-full flex-1 overflow-y-auto p-2" />
		{#if menus.toolbar}
			<ToggleGroup.Root
				type="multiple"
				class={twMerge(' flex w-fit flex-wrap justify-start', !isFocused && 'hidden ')}
				value={formatGroups.flatMap((group) =>
					group.formats.filter((format) => format.isActive()).map((format) => format.name)
				)}
				onValueChange={toggleFormats}
			>
				{#each formatGroups as group}
					{#each group.formats as format}
						<ToggleGroup.Item value={format.name} aria-label={format.label} class="mt-0.5">
							<format.icon />
						</ToggleGroup.Item>
					{/each}
				{/each}
			</ToggleGroup.Root>
		{/if}
		{#if menus.bubble}
			<BubbleMenu editor={$editor} tippyOptions={{ duration: 100 }}>
				<ToggleGroup.Root
					type="multiple"
					class="bubble-menu"
					value={formatGroups.flatMap((group) =>
						group.formats.filter((format) => format.isActive()).map((format) => format.name)
					)}
					onValueChange={toggleFormats}
				>
					{#each formatGroups as group}
						{#each group.formats as format}
							<ToggleGroup.Item value={format.name} aria-label={format.label}>
								<format.icon class="size-4" />
							</ToggleGroup.Item>
						{/each}
					{/each}
				</ToggleGroup.Root>
			</BubbleMenu>
		{/if}
	{/if}
</div>

<style>
	:global(.ProseMirror p.is-editor-empty:first-child::before) {
		content: attr(data-placeholder);
		float: left;
		color: #adb5bd;
		pointer-events: none;
		height: 0;
	}

	:global(.ProseMirror) {
		@apply relative size-full select-none bg-background leading-normal text-foreground focus:outline-none;
		& ul {
			@apply list-disc pl-6;
		}
		& ol {
			@apply list-decimal pl-6;
		}
	}

	:global(.bubble-menu) {
		@apply flex rounded-lg border bg-background;

		button {
			background-color: unset;

			&:hover {
				@apply bg-muted;
			}

			&.is-active {
				@apply bg-zinc-500;
				&:hover {
					@apply bg-zinc-600;
				}
			}
		}
	}
</style>
