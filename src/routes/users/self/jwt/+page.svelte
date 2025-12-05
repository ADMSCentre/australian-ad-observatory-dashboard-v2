<script lang="ts">
	import { auth } from '$lib/api/auth/auth.svelte';
	import { getLocalTimeZone } from '@internationalized/date';
	import { ClipboardIcon, ClipboardCheckIcon } from 'lucide-svelte';

	const decodedToken = $derived.by(() => {
		if (!auth.token) return null;
		try {
			const payload = auth.token.split('.')[1];
			const decodedPayload = atob(payload);
			return JSON.parse(decodedPayload);
		} catch (e) {
			console.error('Failed to decode JWT token', e);
			return null;
		}
	});

	let copied = $state(false);

	const relativeExpiry = $derived.by(() => {
		if (!decodedToken?.exp) return 'unknown time';
		const expiryDate = new Date(decodedToken.exp * 1000);
		const now = new Date();
		// Time in hours and minutes (e.g., "in 3 hours and 15 minutes")
		const duration = {
			hours: Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60)),
			minutes: Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60)) % 60
		};
		let parts = [];
		if (duration.hours > 0) {
			parts.push(`${duration.hours} hour${duration.hours > 1 ? 's' : ''}`);
		}
		if (duration.minutes > 0) {
			parts.push(`${duration.minutes} minute${duration.minutes > 1 ? 's' : ''}`);
		}
		return parts.length > 0 ? `in ${parts.join(' and ')}` : 'now';
	});

	const relativeIssuedAt = $derived.by(() => {
		if (!decodedToken?.iat) return 'unknown time';
		const issuedAtDate = new Date(decodedToken.iat * 1000);
		const now = new Date();
		// Time in hours and minutes (e.g., "3 hours and 15 minutes ago")
		const duration = {
			hours: Math.floor((now.getTime() - issuedAtDate.getTime()) / (1000 * 60 * 60)),
			minutes: Math.floor((now.getTime() - issuedAtDate.getTime()) / (1000 * 60)) % 60
		};
		let parts = [];
		if (duration.hours > 0) {
			parts.push(`${duration.hours} hour${duration.hours > 1 ? 's' : ''}`);
		}
		if (duration.minutes > 0) {
			parts.push(`${duration.minutes} minute${duration.minutes > 1 ? 's' : ''}`);
		}
		return parts.length > 0 ? `${parts.join(' and ')} ago` : 'just now';
	});
</script>

<div class="mx-auto max-w-2xl p-4">
	<h1 class="mb-4 text-2xl font-bold">Your JWT Token</h1>
	<p class="mb-4">
		Click the button below to copy your Json Web Token (JWT) to the clipboard. This token can be
		used to authenticate requests to the <a
			href="https://admscentre.github.io/australian-ad-observatory-api/"
			target="_blank"
			rel="noopener noreferrer"
			class="text-brand no-underline hover:underline"
		>
			Australian Ad Observatory API</a
		>. Keep it secure and do not share it with others.
	</p>
	{#if auth.token}
		<!-- Copy button with animation on click -->
		<button
			class="hover:bg-brand-dark focus:ring-brand-dark mx-auto mt-2 flex w-48 items-center justify-center gap-2 rounded bg-brand px-4 py-2 text-white transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2"
			onclick={() => {
				if (!auth.token) return;
				navigator.clipboard.writeText(auth.token);
				copied = true;
				setTimeout(() => (copied = false), 2000);
			}}
		>
			{#if copied}
				<ClipboardCheckIcon class="h-5 w-5" />
				<span>Copied!</span>
			{:else}
				<ClipboardIcon class="h-5 w-5" />
				<span>Copy to Clipboard</span>
			{/if}
		</button>

		<!-- Token details (only show full name, role, iat and exp) -->
		<div class="mt-4">
			<h2 class="mb-2 text-xl font-semibold">Token Details</h2>
			{#if decodedToken}
				<table class="w-full border-collapse border border-gray-300">
					<tbody>
						{#if decodedToken.full_name}
							<tr class="border-b border-gray-300">
								<td class="p-2 font-semibold">Full Name</td>
								<td class="p-2">{decodedToken.full_name}</td>
							</tr>
						{/if}
						{#if decodedToken.role}
							<tr class="border-b border-gray-300">
								<td class="p-2 font-semibold">Role</td>
								<td class="p-2">{decodedToken.role}</td>
							</tr>
						{/if}
						{#if decodedToken.iat}
							<tr class="border-b border-gray-300">
								<td class="p-2 font-semibold">Issued At</td>
								<td class="p-2">
									{new Date(decodedToken.iat * 1000).toLocaleString('en-GB', {
										hour12: true,
										timeZone: getLocalTimeZone(),
										timeZoneName: 'short',
										month: 'short',
										day: '2-digit',
										hour: '2-digit',
										minute: '2-digit',
										second: '2-digit'
									})} (~{relativeIssuedAt})
								</td>
							</tr>
						{/if}
						{#if decodedToken.exp}
							<tr>
								<td class="p-2 font-semibold">Expires At</td>
								<td class="p-2">
									{new Date(decodedToken.exp * 1000).toLocaleString('en-GB', {
										hour12: true,
										timeZone: getLocalTimeZone(),
										timeZoneName: 'short',
										month: 'short',
										day: '2-digit',
										hour: '2-digit',
										minute: '2-digit',
										second: '2-digit'
									})} (~{relativeExpiry})
								</td>
							</tr>
						{/if}
					</tbody>
				</table>
			{:else}
				<p>Failed to decode token.</p>
			{/if}
		</div>
	{:else}
		<p>You do not have a JWT token. Please generate one from your account settings.</p>
	{/if}
</div>
