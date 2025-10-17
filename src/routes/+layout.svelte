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

	let navigation = ["dashboard", "clients", "leads", "contracts", "settings"];

	// Get the current page title based on route
	$: pageTitle = (() => {
		const path = $page.url.pathname;
		if (path.startsWith('/dashboard')) return 'Dashboard';
		if (path.startsWith('/clients')) return 'Clients';
		if (path.startsWith('/leads')) return 'Leads';
		if (path.startsWith('/contracts')) return 'Contracts';
		if (path.startsWith('/settings')) return 'Settings';
		return 'Dashboard';
	})();

	async function handleLogout() {
		try {
			// Call logout API endpoint to properly sign out server-side
			const response = await fetch('/api/logout', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (response.ok) {
				// API logout successful, redirect to home
				goto('/');
			} else {
				// Fallback: if API fails, still redirect (cookies might still be cleared)
				console.error('Logout API failed:', await response.text());
				goto('/');
			}
		} catch (error) {
			// Fallback: if fetch fails, still redirect
			console.error('Logout request failed:', error);
			goto('/');
		}
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>InboxPilot</title>
	<style>
		body {
			background: #05050a;
			color: #fafafa;
			margin: 0;
			padding: 0;
			overflow-x: hidden;
		}
		html, body {
			height: 100%;
			width: 100%;
		}
	</style>
</svelte:head>

{#if isProtectedRoute && !isAuthenticated}
	<!-- Show loading while checking auth -->
	<div class="flex items-center justify-center h-screen w-screen modern-hero">
		<div class="text-center">
			<div class="relative mx-auto mb-6">
				<div class="animate-spin rounded-full h-16 w-16 border-4 border-purple-400 border-t-purple-600"></div>
				<div class="absolute inset-0 h-16 w-16 animate-pulse rounded-full bg-gradient-to-r from-purple-400 to-cyan-500 opacity-20"></div>
			</div>
			<p class="text-gray-300 font-medium">Checking authentication...</p>
		</div>
	</div>
{:else if isProtectedRoute}
	<!-- Protected layout with sidebar -->
	<div class="flex flex-row h-screen w-screen font-sans">
		<Sidebar {navigation} />
		<main class="flex-1 flex flex-col overflow-hidden">
			<!-- Header with user info and logout -->
			<header class="modern-nav px-6 py-4 flex-shrink-0">
				<div class="flex items-center justify-between">
					<div class="flex items-center space-x-4">
						<div class="h-8 w-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center glow-primary">
							<svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
							</svg>
						</div>
						<h1 class="text-xl font-bold text-white modern-heading">{pageTitle}</h1>
					</div>

					<div class="flex items-center space-x-4">
						<div class="flex items-center space-x-2 modern-card px-3 py-2">
							<div class="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
							<div class="text-sm text-gray-300 font-medium">
								Welcome, {$page.data.user?.email}
							</div>
						</div>
						<button
							on:click={handleLogout}
							class="inline-flex items-center px-4 py-2 btn-primary text-sm leading-4 font-medium transition-all duration-200"
						>
							<svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
							</svg>
							Sign Out
						</button>
					</div>
				</div>
			</header>

			<div class="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-900 to-black w-full">
				{@render children()}
			</div>
		</main>
	</div>
{:else}
	<!-- Public layout without sidebar -->
	{@render children()}
{/if}
