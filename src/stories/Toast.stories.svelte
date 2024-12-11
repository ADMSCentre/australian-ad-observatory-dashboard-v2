<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';
	import Toast from '$lib/components/toasts/toast.svelte';
	import { Button } from '$lib/components/ui/button';
	import { pushToast } from '$lib/components/toasts/toasts.svelte';
	import ContextDecorator from './ContextDecorator.svelte';

	// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
	const { Story } = defineMeta({
		title: 'Example/Toast',
		component: Toast,
		tags: ['autodocs'],
		// @ts-ignore
		decorators: [() => ContextDecorator]
	});
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->

<Button
	variant="default"
	onclick={() => {
		pushToast({
			message: 'This is a toast message',
			type: 'default',
			timeout: 5000
		});
	}}
>
	Create Toast
</Button>

<Story
	name="Default"
	args={{
		toast: {
			id: 3,
			message: 'This is a default message',
			type: 'default'
		}
	}}
/>

<Story
	name="Success"
	args={{
		toast: {
			id: 0,
			message: 'This is a toast message',
			type: 'success'
		}
	}}
/>

<Story
	name="Error"
	args={{
		toast: {
			id: 1,
			message: 'This is an error message',
			type: 'error'
		}
	}}
/>

<Story
	name="Info"
	args={{
		toast: {
			id: 2,
			message: 'This is an info message',
			type: 'info'
		}
	}}
/>
