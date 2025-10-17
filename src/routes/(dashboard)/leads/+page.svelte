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

	let leads: any[] = [];
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

			// Fetch leads list
			const leadsResponse = await fetch(`/api/leads?org_id=${currentOrgId}&limit=10`);
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

	function getIntentColor(intent: string) {
		const intentLower = intent?.toLowerCase() || 'unknown';
		if (intentLower.includes('claim')) return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
		if (intentLower.includes('question')) return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
		if (intentLower.includes('inquiry')) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
		if (intentLower.includes('complaint')) return 'text-red-400 bg-red-500/10 border-red-500/30';
		return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
	}

	function getSentimentColor(sentiment: string) {
		const sentimentLower = sentiment?.toLowerCase() || 'neutral';
		if (sentimentLower.includes('positive')) return 'text-green-400 bg-green-500/10 border-green-500/30';
		if (sentimentLower.includes('negative')) return 'text-red-400 bg-red-500/10 border-red-500/30';
		if (sentimentLower.includes('neutral')) return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
		return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
	}

	function getUrgencyColor(urgency: string) {
		const urgencyLower = urgency?.toLowerCase() || 'low';
		if (urgencyLower.includes('high') || urgencyLower.includes('critical')) return 'text-red-400 bg-red-500/10 border-red-500/30';
		if (urgencyLower.includes('medium') || urgencyLower.includes('moderate')) return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
		if (urgencyLower.includes('low')) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
		return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
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
	<title>Leads - InboxPilot</title>
</svelte:head>

<main class="h-full w-full max-w-full space-y-6">
	<!-- Page Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="modern-heading text-2xl font-bold tracking-tight text-white">Leads</h1>
			<p class="text-sm text-gray-400">Track and manage incoming leads from your inbox</p>
		</div>
		<div class="hidden md:block">
			<div
				class="flex items-center space-x-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 backdrop-blur-sm"
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
				<span class="text-sm font-medium text-purple-200">{stats?.totalLeads || 0} Total</span>
			</div>
		</div>
	</div>

	<!-- Stats Overview -->
	<section class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div
			class="modern-widget border border-purple-500/20 p-5 transition-all hover:border-purple-500/30"
		>
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-sm font-medium text-gray-400">Total Leads</h3>
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
				<div class="gradient-text mb-1 text-2xl font-bold">{stats?.totalLeads || 0}</div>
				<p class="text-xs text-gray-500">All time</p>
			{/if}
		</div>

		<div
			class="modern-widget border border-cyan-500/20 p-5 transition-all hover:border-cyan-500/30"
		>
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-sm font-medium text-gray-400">Recent Leads</h3>
				<div
					class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-600/20"
				>
					<svg class="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
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
	</section>

	<!-- Leads List -->
	<section class="modern-widget border border-purple-500/20 p-5">
		<div class="mb-4 flex items-center justify-between">
			<div>
				<h3 class="text-base font-semibold text-white">All Leads</h3>
				<p class="text-xs text-gray-400">Browse and analyze your incoming leads</p>
			</div>
		</div>

		{#if loading}
			<div class="space-y-3">
				{#each Array(5) as _}
					<div class="flex animate-pulse items-start space-x-3 rounded-lg bg-gray-800/30 p-4">
						<div class="h-10 w-10 rounded-lg bg-gray-700"></div>
						<div class="flex-1 space-y-2">
							<div class="h-4 w-3/4 rounded bg-gray-700"></div>
							<div class="h-3 w-full rounded bg-gray-700"></div>
							<div class="h-3 w-1/2 rounded bg-gray-700"></div>
						</div>
						<div class="h-6 w-16 rounded-full bg-gray-700"></div>
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
		{:else if leads.length > 0}
			<div class="space-y-3">
				{#each leads as lead}
					<div
						class="flex items-start space-x-4 rounded-lg border border-purple-500/20 bg-gradient-to-r from-purple-900/10 to-transparent p-4 transition-all hover:border-purple-500/40 hover:from-purple-900/20"
					>
						<div
							class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20"
						>
							<svg
								class="h-5 w-5 text-purple-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
								/>
							</svg>
						</div>
						<div class="min-w-0 flex-1">
							<div class="truncate text-sm font-semibold text-white">
								{lead.subject || 'No subject'}
							</div>
							<div class="mt-1 line-clamp-2 text-xs text-gray-400">
								{lead.raw_text?.slice(0, 150) || 'No content'}...
							</div>
							
							<!-- AI Analysis Chips -->
							<div class="mt-2 flex flex-wrap items-center gap-1.5">
								{#if lead.intent}
									<span
										class="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize {getIntentColor(
											lead.intent
										)}"
										title="Intent"
									>
										<svg class="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
											<path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
										</svg>
										{lead.intent}
									</span>
								{/if}
								
								{#if lead.sentiment}
									<span
										class="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize {getSentimentColor(
											lead.sentiment
										)}"
										title="Sentiment"
									>
										<svg class="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clip-rule="evenodd" />
										</svg>
										{lead.sentiment}
									</span>
								{/if}
								
								{#if lead.urgency}
									<span
										class="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize {getUrgencyColor(
											lead.urgency
										)}"
										title="Urgency{lead.urgency_score ? ` (Score: ${lead.urgency_score})` : ''}"
									>
										<svg class="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
										</svg>
										{lead.urgency}
										{#if lead.urgency_score}
											<span class="ml-1 opacity-70">({lead.urgency_score})</span>
										{/if}
									</span>
								{/if}
								
								{#if lead.urgency_reasons && lead.urgency_reasons.length > 0}
									{#each lead.urgency_reasons.slice(0, 3) as reason}
										<span
											class="inline-flex items-center rounded-md border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-xs text-purple-300"
											title="Urgency Reason"
										>
											{reason}
										</span>
									{/each}
									{#if lead.urgency_reasons.length > 3}
										<span
											class="inline-flex items-center rounded-md border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-xs text-purple-300"
											title="{lead.urgency_reasons.slice(3).join(', ')}"
										>
											+{lead.urgency_reasons.length - 3} more
										</span>
									{/if}
								{/if}
							</div>
							
							<div class="mt-2 flex items-center space-x-2 text-xs text-gray-500">
								<span>{new Date(lead.created_at).toLocaleDateString()}</span>
								{#if lead.email}
									<span>•</span>
									<span class="truncate">{lead.email}</span>
								{/if}
							</div>
						</div>
					</div>
				{/each}
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
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
				</div>
				<div class="text-sm text-gray-400">No leads found</div>
			</div>
		{/if}
	</section>
</main>
