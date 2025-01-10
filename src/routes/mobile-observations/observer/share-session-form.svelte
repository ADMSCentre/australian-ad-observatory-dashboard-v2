<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { CircleAlert, Share2 } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input';
	import CopyButton from '$lib/components/copy-button.svelte';
	import { guestSessions } from '$lib/api/auth/guest-sessions.svelte';
	import Tiptap from '$lib/components/tiptap.svelte';
	import Dropdown from '$lib/components/dropdown/dropdown.svelte';
	import Timer from '$lib/components/timer.svelte';

	let {
		guestSessionToken = $bindable(),
		guestKey,
		currentPageUrl
	}: {
		guestSessionToken: string | null;
		guestKey: string;
		currentPageUrl: string;
	} = $props();

	const syncGuestToken = async () => {
		guestSessionToken = await guestSessions.getToken(guestKey);
	};

	let sessionDataForm = $state<{
		description: string;
		expirationTime: number;
	} | null>(null);
	$effect(() => {
		const sessionData = guestSessions.find(guestKey);
		if (!sessionData) {
			sessionDataForm = {
				description: `Guest session for observer ${guestKey}`,
				expirationTime: 60 * 60 // 1 hour
			};
		}
		if (sessionData?.data) {
			sessionDataForm = {
				description: sessionData.data.description,
				expirationTime: sessionData.data.exp
			};
		}
	});
</script>

{#snippet formInput()}
	{#if sessionDataForm}
		<div class="flex size-full min-h-56 flex-col gap-4">
			<div class="flex flex-1 flex-col gap-2">
				<label for="description" class="font-bold">Description</label>
				<Tiptap bind:value={sessionDataForm.description} />
			</div>
			<div class="flex flex-row items-center gap-2">
				<label for="expiration" class="font-bold">Expires In</label>
				<Dropdown
					options={[
						{ label: '1 hour', value: (60 * 60).toString() },
						{ label: '1 day', value: (60 * 60 * 24).toString() },
						{ label: '1 week', value: (60 * 60 * 24 * 7).toString() },
						{ label: '1 month', value: (60 * 60 * 24 * 30).toString() },
						{ label: '1 year', value: (60 * 60 * 24 * 365).toString() }
					]}
					selected={(60 * 60).toString()}
					onSelected={(value: string) => {
						if (sessionDataForm) sessionDataForm.expirationTime = +value;
					}}
				/>
			</div>
		</div>
	{/if}
{/snippet}

<Dialog.Root>
	<Dialog.Trigger>
		<Button size="icon" variant={guestSessionToken ? 'destructive' : 'outline'}>
			<Share2 />
		</Button>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Share report</Dialog.Title>
			<Dialog.Description>
				{#if guestSessionToken}
					This report is publicly available until the session expires.
				{:else}
					Click "Create Session" to make this report publicly available.
				{/if}
			</Dialog.Description>
			<div class="flex flex-col gap-4">
				{#if guestSessionToken}
					<Alert.Root variant="destructive">
						<CircleAlert class="size-4" />
						<Alert.Title>Caution!</Alert.Title>
						<Alert.Description>
							Anyone on the internet with the link will have access to this report.
						</Alert.Description>
					</Alert.Root>
					{#if sessionDataForm}
						<div class="flex size-full flex-col gap-4">
							<div class="flex flex-1 flex-col gap-2">
								<label for="description" class="font-bold">Description</label>
								{@html sessionDataForm.description}
							</div>
							<div class="flex flex-row items-center gap-2">
								<label for="expiration" class="font-bold">Expires In</label>
								<Timer exp={sessionDataForm.expirationTime * 1000} />
							</div>
						</div>
					{/if}
					<div class="flex w-full items-center gap-2">
						<Input type="text" value={`${currentPageUrl}`} readonly />
						<CopyButton text={currentPageUrl} />
					</div>
					<Button
						onclick={() => {
							guestSessions.delete(guestKey).then(syncGuestToken);
						}}
						variant="destructive"
					>
						Deactivate Session
					</Button>
				{:else}
					<Alert.Root variant="warning">
						<CircleAlert class="size-4" />
						<Alert.Title>Warning!</Alert.Title>
						<Alert.Description>
							After creating a session, anyone with the link will have access to this report.
						</Alert.Description>
					</Alert.Root>
					{@render formInput()}
					<Button
						onclick={() => {
							if (!sessionDataForm) return;
							guestSessions
								.create({
									key: guestKey,
									description: sessionDataForm.description,
									expirationTime: sessionDataForm.expirationTime
								})
								.then(syncGuestToken);
						}}
					>
						Create Session
					</Button>
				{/if}
			</div>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
