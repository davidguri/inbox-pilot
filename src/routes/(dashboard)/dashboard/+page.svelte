<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let loading = true;
	let error: string | null = null;
	let stats: {
		clients: number;
		totalLeads: number;
		openClaims: number;
		recentLeads: number;
		recentOpenClaims: number;
		leadsByStatus?: Record<string, number>;
	} | null = null;

	let recentActivity: any[] = [];
	let lastLoadedOrgId: string | undefined = undefined;

	// Get org_id from page data
	$: orgId = $page.data.orgId;

	// Debug logging
	$: {
		console.log('=== DASHBOARD DEBUG ===');
		console.log('$page.data:', $page.data);
		console.log('orgId:', orgId);
		console.log('lastLoadedOrgId:', lastLoadedOrgId);
		console.log('loading:', loading);
		console.log('error:', error);
		console.log('======================');
	}

	async function loadData(currentOrgId: string) {
		console.log('loadData called with orgId:', currentOrgId);
		try {
			loading = true;
			error = null;

			// Fetch dashboard stats
			console.log('Fetching stats from:', `/api/dashboard/stats?org_id=${currentOrgId}`);
			const statsResponse = await fetch(`/api/dashboard/stats?org_id=${currentOrgId}`);
			console.log('Stats response status:', statsResponse.status, statsResponse.statusText);

			if (!statsResponse.ok) {
				const errorText = await statsResponse.text();
				console.error('Stats response error:', errorText);
				throw new Error(`Failed to fetch stats: ${statsResponse.statusText} - ${errorText}`);
			}

			stats = await statsResponse.json();
			console.log('Stats loaded:', stats);

			// Fetch recent activity (leads)
			console.log('Fetching leads from:', `/api/leads?org_id=${currentOrgId}&limit=5`);
			const leadsResponse = await fetch(`/api/leads?org_id=${currentOrgId}&limit=5`);
			console.log('Leads response status:', leadsResponse.status, leadsResponse.statusText);

			if (leadsResponse.ok) {
				const leadsData = await leadsResponse.json();
				console.log('Leads data:', leadsData);
				recentActivity = leadsData.leads || [];
			} else {
				const errorText = await leadsResponse.text();
				console.error('Leads response error:', errorText);
			}
		} catch (err) {
			console.error('=== ERROR loading dashboard data ===');
			console.error('Error type:', typeof err);
			console.error('Error:', err);
			console.error('Error message:', err instanceof Error ? err.message : String(err));
			console.error('Error stack:', err instanceof Error ? err.stack : 'No stack');
			error = err instanceof Error ? err.message : 'Failed to load data';
		} finally {
			loading = false;
			console.log('loadData finished. loading:', loading, 'error:', error);
		}
	}

	function navigateTo(section: string) {
		goto(`/${section}`);
	}

	// Only reload when orgId changes
	$: {
		console.log(
			'Reactive statement triggered - orgId:',
			orgId,
			'lastLoadedOrgId:',
			lastLoadedOrgId
		);
		if (orgId && orgId !== lastLoadedOrgId) {
			console.log('Condition met: loading data for orgId:', orgId);
			lastLoadedOrgId = orgId;
			loadData(orgId);
		} else if (!orgId) {
			console.error('No orgId found! Setting error message');
			error = 'No organization ID found';
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Dashboard - InboxPilot</title>
</svelte:head>

<main class="h-full w-full max-w-full space-y-6">
	<!-- Welcome Header - Smaller -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="modern-heading text-2xl font-bold tracking-tight text-white">
				Welcome back, {$page.data.user?.email?.split('@')[0]}!
			</h1>
			<p class="text-sm text-gray-400">Here's an overview of your email management activities</p>
		</div>
		<div class="hidden md:block">
			<div
				class="flex items-center space-x-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 backdrop-blur-sm"
			>
				<div class="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
				<span class="text-sm font-medium text-purple-200">System Online</span>
			</div>
		</div>
	</div>

	<!-- Quick Actions - Inline at Top -->
	<div class="flex flex-wrap gap-3">
		<button
			on:click={() => navigateTo('leads')}
			class="group inline-flex items-center gap-2 rounded-lg border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-purple-600/5 px-4 py-2.5 transition-all duration-300 hover:border-purple-500/40 hover:from-purple-500/20 hover:to-purple-600/10"
		>
			<svg class="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
				/>
			</svg>
			<span class="text-sm font-semibold text-purple-200">Manage Leads</span>
		</button>

		<button
			on:click={() => navigateTo('clients')}
			class="group inline-flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 px-4 py-2.5 transition-all duration-300 hover:border-cyan-500/40 hover:from-cyan-500/20 hover:to-cyan-600/10"
		>
			<svg class="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
				/>
			</svg>
			<span class="text-sm font-semibold text-cyan-200">View Clients</span>
		</button>

		<button
			on:click={() => navigateTo('contracts')}
			class="group inline-flex items-center gap-2 rounded-lg border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-600/5 px-4 py-2.5 transition-all duration-300 hover:border-blue-500/40 hover:from-blue-500/20 hover:to-blue-600/10"
		>
			<svg class="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
				/>
			</svg>
			<span class="text-sm font-semibold text-blue-200">Contracts</span>
		</button>

		<button
			on:click={() => navigateTo('settings')}
			class="group inline-flex items-center gap-2 rounded-lg border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 px-4 py-2.5 transition-all duration-300 hover:border-indigo-500/40 hover:from-indigo-500/20 hover:to-indigo-600/10"
		>
			<svg class="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
				/>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
				/>
			</svg>
			<span class="text-sm font-semibold text-indigo-200">Settings</span>
		</button>
	</div>

	<!-- Stats Overview - Uniform Cards -->
	<section class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
		<div
			class="modern-widget border border-purple-500/20 p-5 transition-all hover:border-purple-500/30"
		>
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-sm font-medium text-gray-400">Total Clients</h3>
				<div
					class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20"
				>
					<svg
						class="h-4 w-4 text-purple-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
						/>
					</svg>
				</div>
			</div>
			{#if loading}
				<div class="animate-pulse">
					<div class="mb-2 h-8 w-16 rounded bg-gray-700"></div>
					<div class="h-4 w-24 rounded bg-gray-700"></div>
				</div>
			{:else if error}
				<p class="text-sm text-red-400">{error}</p>
			{:else}
				<div class="gradient-text mb-1 text-2xl font-bold">{stats?.clients || 0}</div>
				<p class="text-xs text-gray-500">Active clients</p>
			{/if}
		</div>

		<div
			class="modern-widget border border-purple-500/20 p-5 transition-all hover:border-purple-500/30"
		>
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-sm font-medium text-gray-400">Total Leads</h3>
				<div
					class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-600/20"
				>
					<svg class="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
				</div>
			</div>
			{#if loading}
				<div class="animate-pulse">
					<div class="mb-2 h-8 w-16 rounded bg-gray-700"></div>
					<div class="h-4 w-24 rounded bg-gray-700"></div>
				</div>
			{:else if error}
				<p class="text-sm text-red-400">{error}</p>
			{:else}
				<div class="gradient-text mb-1 text-2xl font-bold">{stats?.totalLeads || 0}</div>
				<p class="text-xs text-gray-500">All time</p>
			{/if}
		</div>

		<div
			class="modern-widget border border-purple-500/20 p-5 transition-all hover:border-purple-500/30"
		>
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-sm font-medium text-gray-400">Inbox</h3>
				<div
					class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-600/20"
				>
					<svg class="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
						<path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
						<path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
					</svg>
				</div>
			</div>
			<div class="gradient-text mb-1 text-2xl font-bold">247</div>
			<p class="text-xs text-gray-500">Unprocessed emails</p>
		</div>

		<div
			class="modern-widget border border-purple-500/20 p-5 transition-all hover:border-purple-500/30"
		>
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-sm font-medium text-gray-400">Open Claims</h3>
				<div
					class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20"
				>
					<svg class="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
						/>
					</svg>
				</div>
			</div>
			{#if loading}
				<div class="animate-pulse">
					<div class="mb-2 h-8 w-16 rounded bg-gray-700"></div>
					<div class="h-4 w-24 rounded bg-gray-700"></div>
				</div>
			{:else if error}
				<p class="text-sm text-red-400">{error}</p>
			{:else}
				<div class="gradient-text mb-1 text-2xl font-bold">{stats?.openClaims || 0}</div>
				<p class="text-xs text-gray-500">Requiring attention</p>
			{/if}
		</div>
	</section>

	<!-- Additional Stats Row - Uniform Cards -->
	<section class="grid grid-cols-1 gap-4 md:grid-cols-3">
		<div
			class="modern-widget border border-purple-500/20 p-5 transition-all hover:border-purple-500/30"
		>
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-sm font-medium text-gray-400">Email Volume</h3>
				<div
					class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20"
				>
					<svg class="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
						/>
					</svg>
				</div>
			</div>
			<div class="gradient-text mb-1 text-2xl font-bold">1,247</div>
			<div class="text-xs text-gray-500">This month</div>
			<div class="mt-3 flex items-center text-xs text-green-400">
				<svg class="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
						clip-rule="evenodd"
					/>
				</svg>
				+12.3% from last month
			</div>
		</div>

		<div
			class="modern-widget border border-purple-500/20 p-5 transition-all hover:border-purple-500/30"
		>
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-sm font-medium text-gray-400">Response Rate</h3>
				<div
					class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20"
				>
					<svg class="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
			</div>
			<div class="gradient-text mb-1 text-2xl font-bold">94.2%</div>
			<div class="text-xs text-gray-500">Avg. response: 2.3h</div>
			<div class="mt-3 flex items-center text-xs text-green-400">
				<svg class="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
						clip-rule="evenodd"
					/>
				</svg>
				+5.1% improvement
			</div>
		</div>

		<div
			class="modern-widget border border-purple-500/20 p-5 transition-all hover:border-purple-500/30"
		>
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-sm font-medium text-gray-400">Conversion Rate</h3>
				<div
					class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20"
				>
					<svg
						class="h-4 w-4 text-purple-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
						/>
					</svg>
				</div>
			</div>
			<div class="gradient-text mb-1 text-2xl font-bold">23.7%</div>
			<div class="text-xs text-gray-500">Leads to clients</div>
			<div class="mt-3 flex items-center text-xs text-green-400">
				<svg class="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
						clip-rule="evenodd"
					/>
				</svg>
				+3.4% this quarter
			</div>
		</div>
	</section>

	<!-- Live Activity & Recent Activity -->
	<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
		<!-- Live Activity -->
		<section class="modern-widget border border-purple-500/20 p-5">
			<div class="mb-4 flex items-center justify-between">
				<div class="flex items-center space-x-3">
					<div
						class="glow-primary h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700"
					></div>
					<div>
						<div class="text-xs text-gray-400">Dashboard</div>
						<div class="text-base font-semibold text-white">Live Activity</div>
					</div>
				</div>
			</div>

			<div class="space-y-3">
				<div
					class="flex items-center justify-between rounded-lg border border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-transparent p-3 transition-all hover:border-purple-500/40"
				>
					<div class="flex items-center space-x-3">
						<div class="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
						<span class="text-sm font-medium text-white">New Lead Detected</span>
					</div>
					<span class="text-xs text-purple-300">2m ago</span>
				</div>

				<div
					class="flex items-center justify-between rounded-lg border border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-transparent p-3 transition-all hover:border-purple-500/40"
				>
					<div class="flex items-center space-x-3">
						<div class="h-2 w-2 animate-pulse rounded-full bg-cyan-400"></div>
						<span class="text-sm font-medium text-white">Email Classified</span>
					</div>
					<span class="text-xs text-purple-300">5m ago</span>
				</div>

				<div
					class="flex items-center justify-between rounded-lg border border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-transparent p-3 transition-all hover:border-purple-500/40"
				>
					<div class="flex items-center space-x-3">
						<div class="h-2 w-2 animate-pulse rounded-full bg-purple-400"></div>
						<span class="text-sm font-medium text-white">Client Updated</span>
					</div>
					<span class="text-xs text-purple-300">12m ago</span>
				</div>
			</div>
		</section>

		<!-- Recent Activity -->
		<section class="modern-widget border border-purple-500/20 p-5">
			<div class="mb-4">
				<h3 class="text-base font-semibold text-white">Recent Activity</h3>
			</div>

			{#if loading}
				<div class="space-y-3">
					{#each Array(3) as _}
						<div class="flex animate-pulse items-start space-x-3 rounded-lg bg-gray-800/30 p-3">
							<div class="mt-2 h-2 w-2 rounded-full bg-gray-700"></div>
							<div class="flex-1 space-y-2">
								<div class="h-4 w-3/4 rounded bg-gray-700"></div>
								<div class="h-3 w-1/2 rounded bg-gray-700"></div>
							</div>
						</div>
					{/each}
				</div>
			{:else if error}
				<p class="py-8 text-center text-sm text-red-400">{error}</p>
			{:else if recentActivity.length > 0}
				<div class="space-y-3">
					{#each recentActivity as activity}
						<div
							class="flex items-start space-x-3 rounded-lg border border-purple-500/20 bg-gradient-to-r from-purple-900/10 to-transparent p-3 transition-all hover:border-purple-500/40"
						>
							<div
								class="mt-1 h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-gradient-to-r from-purple-400 to-cyan-400"
							></div>
							<div class="min-w-0 flex-1">
								<div class="truncate text-sm font-semibold text-white">
									{activity.name || 'New Lead'}
								</div>
								<div class="truncate text-xs text-gray-400">{activity.email}</div>
								<div class="mt-1 text-xs text-gray-500">
									{new Date(activity.created_at).toLocaleDateString()}
								</div>
							</div>
						</div>
					{/each}
				</div>
				<div class="mt-4 border-t border-purple-500/20 pt-3">
					<button
						on:click={() => navigateTo('leads')}
						class="w-full rounded-lg bg-purple-500/20 px-4 py-2 text-center text-sm font-medium text-purple-300 transition-colors hover:bg-purple-500/30 hover:text-purple-200"
					>
						View all leads →
					</button>
				</div>
			{:else}
				<div class="py-8 text-center">
					<div
						class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10"
					>
						<svg
							class="h-6 w-6 text-purple-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<div class="text-sm text-gray-400">No recent activity</div>
				</div>
			{/if}
		</section>
	</div>
</main>
