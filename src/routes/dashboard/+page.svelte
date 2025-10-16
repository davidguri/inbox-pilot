<script lang="ts">
	import Widget from '$lib/components/Widget.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
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

	// Get org_id from page data or URL params
	const orgId = $page.url.searchParams.get('org_id') || 'default-org';

	async function loadData() {
		try {
			loading = true;
			error = null;

			// Fetch dashboard stats
			const statsResponse = await fetch(`/api/dashboard/stats?org_id=${orgId}`);
			if (!statsResponse.ok) {
				throw new Error(`Failed to fetch stats: ${statsResponse.statusText}`);
			}
			stats = await statsResponse.json();

			// Fetch recent activity (leads)
			const leadsResponse = await fetch(`/api/leads?org_id=${orgId}&limit=5`);
			if (leadsResponse.ok) {
				const leadsData = await leadsResponse.json();
				recentActivity = leadsData.leads || [];
			}
		} catch (err) {
			console.error('Error loading dashboard data:', err);
			error = err instanceof Error ? err.message : 'Failed to load data';
		} finally {
			loading = false;
		}
	}

	function navigateTo(section: string) {
		goto(`/${section}?org_id=${orgId}`);
	}

	onMount(() => {
		loadData();
	});
</script>

<svelte:head>
	<title>Dashboard - InboxPilot</title>
</svelte:head>

<main class="space-y-8">
	<!-- Welcome Header -->
	<div class="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
		<h1 class="mb-2 text-2xl font-bold">Welcome back, {$page.data.user?.email}!</h1>
		<p class="text-indigo-100">Here's an overview of your email management activities</p>
	</div>

	<!-- Stats Overview -->
	<section class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Widget
			title="Total Clients"
			{loading}
			{error}
			count={stats?.clients}
			subtitle="Active clients"
		>
			<button
				on:click={() => navigateTo('clients')}
				class="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
			>
				View all →
			</button>
		</Widget>

		<Widget title="Total Leads" {loading} {error} count={stats?.totalLeads} subtitle="All time">
			<button
				on:click={() => navigateTo('leads')}
				class="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
			>
				View all →
			</button>
		</Widget>

		<Widget
			title="Recent Leads"
			{loading}
			{error}
			count={stats?.recentLeads}
			subtitle="Last 30 days"
		/>

		<Widget
			title="Open Claims"
			{loading}
			{error}
			count={stats?.openClaims}
			subtitle="Requiring attention"
		>
			<button
				on:click={() => navigateTo('contracts')}
				class="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
			>
				View all →
			</button>
		</Widget>
	</section>

	<!-- Quick Actions & Recent Activity -->
	<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
		<!-- Quick Actions -->
		<section>
			<Widget title="Quick Actions" {loading} {error}>
				<div class="grid grid-cols-2 gap-3">
					<button
						on:click={() => navigateTo('leads')}
						class="flex flex-col items-center rounded-lg bg-indigo-50 p-4 transition-colors hover:bg-indigo-100"
					>
						<svg
							class="mb-2 h-8 w-8 text-indigo-600"
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
						<span class="text-sm font-medium text-indigo-700">Manage Leads</span>
					</button>

					<button
						on:click={() => navigateTo('clients')}
						class="flex flex-col items-center rounded-lg bg-green-50 p-4 transition-colors hover:bg-green-100"
					>
						<svg
							class="mb-2 h-8 w-8 text-green-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
							/>
						</svg>
						<span class="text-sm font-medium text-green-700">View Clients</span>
					</button>

					<button
						on:click={() => navigateTo('contracts')}
						class="flex flex-col items-center rounded-lg bg-purple-50 p-4 transition-colors hover:bg-purple-100"
					>
						<svg
							class="mb-2 h-8 w-8 text-purple-600"
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
						<span class="text-sm font-medium text-purple-700">Contracts</span>
					</button>

					<button
						on:click={() => navigateTo('settings')}
						class="flex flex-col items-center rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
					>
						<svg
							class="mb-2 h-8 w-8 text-gray-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
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
						<span class="text-sm font-medium text-gray-700">Settings</span>
					</button>
				</div>
			</Widget>
		</section>

		<!-- Recent Activity -->
		<section>
			<Widget title="Recent Activity" {loading} {error}>
				{#if recentActivity.length > 0}
					<div class="space-y-3">
						{#each recentActivity as activity}
							<div class="flex items-start space-x-3">
								<div class="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-indigo-400"></div>
								<div class="flex-1">
									<div class="text-sm font-medium">{activity.name || 'New Lead'}</div>
									<div class="text-xs text-gray-500">{activity.email}</div>
									<div class="text-xs text-gray-400">
										{new Date(activity.created_at).toLocaleDateString()}
									</div>
								</div>
							</div>
						{/each}
					</div>
					<button
						on:click={() => navigateTo('leads')}
						class="mt-3 w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
					>
						View all leads →
					</button>
				{:else}
					<div class="py-4 text-center text-gray-500">No recent activity</div>
				{/if}
			</Widget>
		</section>
	</div>
</main>
