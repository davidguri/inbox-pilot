<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Sidebar from '../lib/components/Sidebar.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	export let children;

	// Check if current route is protected (dashboard routes)
	$: isProtectedRoute = $page.url.pathname.startsWith('/dashboard') ||
		$page.url.pathname.startsWith('/clients') ||
		$page.url.pathname.startsWith('/leads') ||
		$page.url.pathname.startsWith('/contracts') ||
		$page.url.pathname.startsWith('/settings');

	// Check if user is authenticated
	$: isAuthenticated = !!$page.data.user;

	let navigation = ["dashboard", "clients", "contracts", "leads", "settings"];

	function handleLogout() {
		// Clear cookies and redirect to home
		document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
		document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
		goto('/');
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>InboxPilot</title>
</svelte:head>

{#if isProtectedRoute && !isAuthenticated}
	<!-- Show loading while checking auth -->
	<div class="flex items-center justify-center h-screen">
		<div class="text-center">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
			<p class="text-gray-600">Checking authentication...</p>
		</div>
	</div>
{:else if isProtectedRoute}
	<!-- Protected layout with sidebar -->
	<div class="flex flex-row h-screen font-sans">
		<Sidebar {navigation} />
		<main class="flex-1 overflow-hidden">
			<!-- Header with user info and logout -->
			<header class="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
				<div class="flex items-center justify-between">
					<div class="flex items-center space-x-4">
						<h1 class="text-xl font-semibold text-gray-900">Dashboard</h1>
					</div>

					<div class="flex items-center space-x-4">
						<div class="text-sm text-gray-600">
							Welcome, {$page.data.user?.email}
						</div>
						<button
							on:click={handleLogout}
							class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
						>
							Sign Out
						</button>
					</div>
				</div>
			</header>

			<div class="flex-1 p-6 overflow-y-auto">
				{@render children()}
			</div>
		</main>
	</div>
{:else}
	<!-- Public layout without sidebar -->
	{@render children()}
{/if}
