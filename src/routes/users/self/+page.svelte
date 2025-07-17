<script lang="ts">
	import { auth } from '$lib/api/auth/auth.svelte';
	import { User, UserCircle } from 'lucide-svelte';
	import { client } from '$lib/api/client';
	import PageLoader from '$lib/components/page-loader/page-loader.svelte';
	import Dropdown from '$lib/components/dropdown/dropdown.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Circle } from 'svelte-loading-spinners';
	import { theme } from '$lib/states/theme.svelte';
	import { pushToast } from '$lib/components/toasts/toasts.svelte';

	// const formData = $derived.by(async () => {
	// 	const { data, error } = await client.GET('/users/self');
	// 	if (error) {
	// 		console.error(error);
	// 		return {};
	// 	}
	// 	return data;
	// });

	type UserData = {
		enabled?: boolean;
		password?: string;
		username?: string;
		full_name?: string;
		role?: 'admin' | 'user';
	};

	let originalFormData = $state<UserData | null>();
	let formData = $state<UserData | null>();

	const fields = $derived([
		{
			label: 'Username',
			value: formData?.username || '',
			type: {
				name: 'text'
			}
		},
		{
			label: 'Full Name',
			value: formData?.full_name || '',
			type: {
				name: 'text'
			},
			onEdit: (value: string) => {
				formData = {
					...formData,
					full_name: value
				};
			}
		},
		{
			label: 'Password',
			value: formData?.password || '',
			type: {
				name: 'password'
			},
			editable: true,
			onEdit: (value: string) => {
				formData = {
					...formData,
					password: value
				};
			}
		},
		{
			label: 'Role',
			value: formData?.role || 'user',
			type: {
				name: 'dropdown',
				options: [
					{
						value: 'admin',
						label: 'Admin'
					},
					{
						value: 'user',
						label: 'User'
					}
				]
			},
			onEdit:
				formData?.role === 'admin'
					? (value: string) => {
							formData = {
								...formData,
								role: value as 'admin' | 'user'
							};
						}
					: undefined
		}
	]);

	$effect(() => {
		(async () => {
			const { data, error } = await client.GET('/users/self', {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			});
			if (error) {
				console.error(error);
				return;
			}
			formData = data as UserData;
			originalFormData = data as UserData;
		})();
	});

	const hasChanges = $derived.by(() => {
		if (!formData || !originalFormData) return false;
		return JSON.stringify(formData) !== JSON.stringify(originalFormData);
	});

	let isEditLoading = $state(false);
	const onEditConfirm = async () => {
		if (!formData) return;
		isEditLoading = true;

		type Key = keyof UserData;

		// Only extract fields that have changed
		const changedFields = (Object.keys(formData) as (keyof UserData)[]).reduce(
			(acc: { [key: string]: any }, key: Key) => {
				if (!formData || !originalFormData) return acc;
				if (formData[key] !== originalFormData[key]) {
					acc[key] = formData[key];
				}
				return acc;
			},
			{}
		);

		const { data, error } = await client.PATCH('/users/{username}', {
			headers: {
				Authorization: `Bearer ${auth.token}`
			},
			params: {
				path: {
					username: formData.username || ''
				}
			},
			body: changedFields
		});
		isEditLoading = false;
		if (error) {
			console.error(error);
			pushToast({
				message: 'Failed to update user profile',
				type: 'error',
				timeout: 5000
			});
			return;
		}
		pushToast({
			message: 'User profile updated successfully',
			type: 'success',
			timeout: 5000
		});
		originalFormData = formData;
	};
</script>

{#snippet field(
	label: string,
	value: string,
	type: {
		name: string;
		options?: { value: string; label: string }[];
	},
	onEdit?: (value: string) => void
)}
	<strong>{label}</strong>
	{#if !onEdit}
		<Input type={type.name} {value} readonly disabled />
	{:else if type.name === 'dropdown' && type.options}
		<Dropdown
			options={type.options}
			selected={formData?.role}
			onSelected={(value) => {
				formData = {
					...formData,
					role: value
				};
			}}
		/>
	{:else}
		<Input
			type={type.name}
			{value}
			oninput={(e) => {
				console.log(e);
				if (!e.target) return;
				const target = e.target as HTMLInputElement;
				onEdit(target.value);
			}}
		/>
	{/if}
{/snippet}

<h1>User Profile</h1>

{#if !formData}
	<PageLoader />
{:else}
	<section class="flex size-full flex-col items-center gap-8 px-4">
		<div class="flex flex-col items-center">
			<UserCircle size={128} />
			<h2>{formData.full_name}</h2>
			<p class="italic text-muted-foreground">{formData.username}</p>
		</div>
		<div class="flex flex-col items-center gap-1">
			<div class="grid grid-cols-2 items-center gap-6">
				{#each fields as { label, value, type, onEdit }, i}
					{@render field(label, value, type, onEdit)}
				{/each}
			</div>
		</div>
		<Button disabled={!hasChanges || isEditLoading} class="w-32" onclick={onEditConfirm}>
			{#if isEditLoading}
				<Circle color={theme.colors.background} size={20} />
			{:else}
				Save Changes
			{/if}
		</Button>
	</section>
{/if}

<!-- <pre>{JSON.stringify(formData, null, 2)}</pre> -->
