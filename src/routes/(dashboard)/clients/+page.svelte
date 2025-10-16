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

	let clients: any[] = [];

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

			// Fetch clients list
			const clientsResponse = await fetch(`/api/clients?org_id=${orgId}&limit=10`);
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

	onMount(() => {
		loadData();
	});
</script>

<main>
	<section class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
		<Widget
			title="Total Clients"
			{loading}
			{error}
			count={stats?.clients}
			subtitle="Active clients"
		/>

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
		/>
	</section>

	<section class="mt-8">
		<Widget title="Recent Clients" {loading} {error}>
			{#if clients.length > 0}
				<div class="space-y-2">
					{#each clients.slice(0, 5) as client}
						<div class="flex items-center justify-between rounded bg-gray-50 p-2">
							<div>
								<div class="font-medium">{client.name || 'Unnamed Client'}</div>
								<div class="text-sm text-gray-600">{client.email}</div>
							</div>
							<div class="text-sm text-gray-500">
								{new Date(client.created_at).toLocaleDateString()}
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="py-4 text-center text-gray-500">No clients found</div>
			{/if}
		</Widget>
	</section>
</main>
