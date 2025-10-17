<script lang="ts">
	import { page } from '$app/stores';

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

	let clients: any[] = [];
	let lastLoadedOrgId: string | undefined = undefined;

	// Get org_id from page data
	$: orgId = $page.data.orgId;

	async function loadData(currentOrgId: string) {
		try {
			loading = true;
			error = null;

			// Fetch dashboard stats
			const statsResponse = await fetch(`/api/dashboard/stats?org_id=${currentOrgId}`);
			if (!statsResponse.ok) {
				throw new Error(`Failed to fetch stats: ${statsResponse.statusText}`);
			}
			stats = await statsResponse.json();

			// Fetch clients list
			const clientsResponse = await fetch(`/api/clients?org_id=${currentOrgId}&limit=10`);
			if (clientsResponse.ok) {
				const clientsData = await clientsResponse.json();
				clients = clientsData.clients || [];
			}
		} catch (err) {
			console.error('Error loading clients data:', err);
			error = err instanceof Error ? err.message : 'Failed to load data';
		} finally {
			loading = false;
		}
	}

	// Only reload when orgId changes
	$: if (orgId && orgId !== lastLoadedOrgId) {
		lastLoadedOrgId = orgId;
		loadData(orgId);
	} else if (!orgId) {
		error = 'No organization ID found';
		loading = false;
	}
</script>

<svelte:head>
	<title>Clients - InboxPilot</title>
</svelte:head>

<main class="h-full w-full max-w-full space-y-6">
	<!-- Page Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="modern-heading text-2xl font-bold tracking-tight text-white">Clients</h1>
			<p class="text-sm text-gray-400">Manage your active clients and view their details</p>
		</div>
		<div class="hidden md:block">
			<div
				class="flex items-center space-x-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 backdrop-blur-sm"
			>
				<svg class="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
					/>
				</svg>
				<span class="text-sm font-medium text-cyan-200">{stats?.clients || 0} Active</span>
			</div>
		</div>
	</div>

	<!-- Stats Overview -->
	<section class="grid grid-cols-1 gap-4 md:grid-cols-3">
		<div
			class="modern-widget border border-cyan-500/20 p-5 transition-all hover:border-cyan-500/30"
		>
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-sm font-medium text-gray-400">Total Clients</h3>
				<div
					class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-600/20"
				>
					<svg class="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
				<h3 class="text-sm font-medium text-gray-400">Recent Leads</h3>
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
				<div class="gradient-text mb-1 text-2xl font-bold">{stats?.recentLeads || 0}</div>
				<p class="text-xs text-gray-500">Last 30 days</p>
			{/if}
		</div>

		<div
			class="modern-widget border border-blue-500/20 p-5 transition-all hover:border-blue-500/30"
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

	<!-- Clients List -->
	<section class="modern-widget border border-cyan-500/20 p-5">
		<div class="mb-4 flex items-center justify-between">
			<div>
				<h3 class="text-base font-semibold text-white">All Clients</h3>
				<p class="text-xs text-gray-400">View and manage your client relationships</p>
			</div>
		</div>

		{#if loading}
			<div class="space-y-3">
				{#each Array(5) as _}
					<div class="flex animate-pulse items-start space-x-3 rounded-lg bg-gray-800/30 p-3">
						<div class="h-10 w-10 rounded-full bg-gray-700"></div>
						<div class="flex-1 space-y-2">
							<div class="h-4 w-3/4 rounded bg-gray-700"></div>
							<div class="h-3 w-1/2 rounded bg-gray-700"></div>
						</div>
						<div class="h-4 w-20 rounded bg-gray-700"></div>
					</div>
				{/each}
			</div>
		{:else if error}
			<div class="py-8 text-center">
				<div
					class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10"
				>
					<svg
						class="h-6 w-6 text-red-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<p class="text-sm text-red-400">{error}</p>
			</div>
		{:else if clients.length > 0}
			<div class="space-y-3">
				{#each clients as client}
					<div
						class="flex items-center space-x-4 rounded-lg border border-cyan-500/20 bg-gradient-to-r from-cyan-900/10 to-transparent p-4 transition-all hover:border-cyan-500/40 hover:from-cyan-900/20"
					>
						<div
							class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/20"
						>
							<span class="text-sm font-bold text-cyan-300">
								{(client.name || 'U')[0].toUpperCase()}
							</span>
						</div>
						<div class="min-w-0 flex-1">
							<div class="truncate text-sm font-semibold text-white">
								{client.name || 'Unnamed Client'}
							</div>
							<div class="truncate text-xs text-gray-400">{client.email}</div>
						</div>
						<div class="flex-shrink-0 text-right">
							<div class="text-xs text-gray-500">
								{new Date(client.created_at).toLocaleDateString()}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="py-8 text-center">
				<div
					class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10"
				>
					<svg
						class="h-6 w-6 text-cyan-400"
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
				<div class="text-sm text-gray-400">No clients found</div>
			</div>
		{/if}
	</section>
</main>
