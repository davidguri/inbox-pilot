<script lang="ts">
	export let title: string;
	export let className: string = '';
	export let children: any = null;
	export let loading: boolean = false;
	export let error: string | null = null;
	export let count: number | null = null;
	export let subtitle: string | null = null;
</script>

<section class="mb-4 rounded-lg bg-white p-4 shadow-md {className}">
	<h2 class="mb-2 text-xl font-bold">{title}</h2>

	{#if loading}
		<div class="flex items-center justify-center py-8">
			<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
			<span class="ml-3 text-gray-600">Loading...</span>
		</div>
	{:else if error}
		<div class="py-4 text-red-600">
			<p>Error: {error}</p>
		</div>
	{:else if count !== null}
		<div class="py-6 text-center">
			<div class="mb-2 text-4xl font-bold text-blue-600">{count}</div>
			{#if subtitle}
				<div class="text-sm text-gray-600">{subtitle}</div>
			{/if}
		</div>
		{#if children}
			<div class="mt-4">
				{@render children()}
			</div>
		{/if}
	{:else if children}
		<div class="text-gray-700">
			{@render children()}
		</div>
	{:else}
		<div class="py-4 text-center text-gray-500">No data available</div>
	{/if}
</section>
