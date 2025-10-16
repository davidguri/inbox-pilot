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

	let claims: any[] = [];

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

			// Fetch claims list
			const claimsResponse = await fetch(`/api/claims?org_id=${orgId}&limit=10`);
			if (claimsResponse.ok) {
				const claimsData = await claimsResponse.json();
				claims = claimsData.claims || [];
			}
		} catch (err) {
			console.error('Error loading claims data:', err);
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
			title="Open Claims"
			{loading}
			{error}
			count={stats?.openClaims}
			subtitle="Requiring attention"
		/>

		<Widget
			title="Recent Claims"
			{loading}
			{error}
			count={stats?.recentOpenClaims}
			subtitle="Last 30 days"
		/>

		<Widget title="Claims by Priority" {loading} {error}>
			{#if claims.length > 0}
				{@const priorityCounts = claims.reduce((acc, claim) => {
					const priority = claim.priority || 'medium';
					acc[priority] = (acc[priority] || 0) + 1;
					return acc;
				}, {})}
				<div class="space-y-2">
					{#each Object.entries(priorityCounts) as [priority, count]}
						<div class="flex items-center justify-between">
							<span class="text-sm capitalize">{priority}</span>
							<span class="font-semibold">{count}</span>
						</div>
					{/each}
				</div>
			{:else}
				<div class="py-4 text-center text-gray-500">No claims data available</div>
			{/if}
		</Widget>
	</section>

	<section class="mt-8">
		<Widget title="Recent Claims" {loading} {error}>
			{#if claims.length > 0}
				<div class="space-y-2">
					{#each claims.slice(0, 5) as claim}
						<div class="flex items-center justify-between rounded bg-gray-50 p-2">
							<div class="flex-1">
								<div class="truncate font-medium">{claim.title || 'Untitled Claim'}</div>
								<div class="truncate text-sm text-gray-600">
									{claim.description?.slice(0, 100) || 'No description'}...
								</div>
							</div>
							<div class="text-right text-sm">
								<div class="text-gray-500 capitalize">{claim.status || 'open'}</div>
								<div class="text-gray-500 capitalize">{claim.priority || 'medium'}</div>
								<div class="text-gray-500">
									{new Date(claim.created_at).toLocaleDateString()}
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="py-4 text-center text-gray-500">No claims found</div>
			{/if}
		</Widget>
	</section>
</main>
