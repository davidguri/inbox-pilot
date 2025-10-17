<script lang="ts">
	export let title: string;
	export let className: string = '';
	export let children: any = null;
	export let loading: boolean = false;
	export let error: string | null = null;
	export let count: number | null = null;
	export let subtitle: string | null = null;
</script>

<section class="mb-6 rounded-xl p-6 shadow-lg transition-all duration-300 {className}">
	<h2 class="mb-4 text-xl font-bold text-white tracking-tight">{title}</h2>

	{#if loading}
		<div class="flex items-center justify-center py-8">
			<div class="relative">
				<div class="h-10 w-10 animate-spin rounded-full border-4 border-purple-400/20 border-t-purple-500"></div>
				<div class="absolute inset-0 h-10 w-10 animate-pulse rounded-full bg-gradient-to-r from-purple-400 to-cyan-500 opacity-20"></div>
			</div>
			<span class="ml-4 text-gray-300 font-medium">Loading...</span>
		</div>
	{:else if error}
		<div class="py-4 text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg p-3">
			<div class="flex items-center">
				<svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
				</svg>
				<p class="font-medium">Error: {error}</p>
			</div>
		</div>
	{:else if count !== null}
		<div class="py-8 text-center">
			<div class="mb-3 text-5xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{count}</div>
			{#if subtitle}
				<div class="text-sm text-gray-400 font-medium">{subtitle}</div>
			{/if}
		</div>
		{#if children}
			<div class="mt-6">
				{@render children()}
			</div>
		{/if}
	{:else if children}
		<div class="text-gray-300">
			{@render children()}
		</div>
	{:else}
		<div class="py-8 text-center">
			<div class="mx-auto h-12 w-12 bg-gray-800/50 rounded-full flex items-center justify-center mb-3">
				<svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
				</svg>
			</div>
			<div class="text-gray-400 font-medium">No data available</div>
		</div>
	{/if}
</section>
