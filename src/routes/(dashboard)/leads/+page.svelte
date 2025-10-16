<script lang="ts">
	import Widget from '$lib/components/Widget.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

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

	let leads: any[] = [];

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

			// Fetch leads list
			const leadsResponse = await fetch(`/api/leads?org_id=${orgId}&limit=10`);
			if (leadsResponse.ok) {
				const leadsData = await leadsResponse.json();
				leads = leadsData.leads || [];
			}
		} catch (err) {
			console.error('Error loading leads data:', err);
			error = err instanceof Error ? err.message : 'Failed to load data';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadData();
	});
</script>

<main>
	<section class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
		<Widget title="Total Leads" {loading} {error} count={stats?.totalLeads} subtitle="All time" />

		<Widget
			title="Recent Leads"
			{loading}
			{error}
			count={stats?.recentLeads}
			subtitle="Last 30 days"
		/>

		<Widget title="Leads by Status" {loading} {error}>
			{#if stats?.leadsByStatus}
				<div class="space-y-2">
					{#each Object.entries(stats.leadsByStatus) as [status, count]}
						<div class="flex items-center justify-between">
							<span class="text-sm capitalize">{status}</span>
							<span class="font-semibold">{count}</span>
						</div>
					{/each}
				</div>
			{:else}
				<div class="py-4 text-center text-gray-500">No status data available</div>
			{/if}
		</Widget>
	</section>

	<section class="mt-8">
		<Widget title="Recent Leads" {loading} {error}>
			{#if leads.length > 0}
				<div class="space-y-2">
					{#each leads.slice(0, 5) as lead}
						<div class="flex items-center justify-between rounded bg-gray-50 p-2">
							<div class="flex-1">
								<div class="truncate font-medium">{lead.subject || 'No subject'}</div>
								<div class="truncate text-sm text-gray-600">
									{lead.raw_text?.slice(0, 100) || 'No content'}...
								</div>
							</div>
							<div class="text-right text-sm">
								<div class="text-gray-500 capitalize">{lead.intent || 'unknown'}</div>
								<div class="text-gray-500">
									{new Date(lead.created_at).toLocaleDateString()}
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="py-4 text-center text-gray-500">No leads found</div>
			{/if}
		</Widget>
	</section>
</main>
