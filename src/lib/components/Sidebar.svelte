<script lang="ts">
	export let navigation: string[] = [];
	import { goto } from '$app/navigation';

	function navigateTo(item: string) {
		goto(`/${item}`);
	}

	function handleLogout() {
		// Clear cookies and redirect to home
		document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
		document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
		goto('/');
	}
</script>

<aside class="w-64 modern-sidebar text-white flex flex-col h-full shadow-2xl border-r border-purple-500/10">
	<div class="p-6 border-b border-purple-500/20">
		<div class="flex items-center space-x-3 mb-2">
			<div class="h-8 w-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center glow-primary">
				<svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
				</svg>
			</div>
			<div>
				<h1 class="text-xl font-bold text-white modern-heading">InboxPilot</h1>
				<p class="text-xs text-gray-400">Smart Email Management</p>
			</div>
		</div>
	</div>

	<nav class="flex-1 p-4">
		<ul class="space-y-1">
			{#each navigation as item}
				<li>
					<button
						class="w-full text-left px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-cyan-500/20 hover:text-purple-300 transition-all duration-300 flex items-center space-x-3 group"
						onclick={() => navigateTo(item)}
					>
						<div class="h-2 w-2 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
						<span class="capitalize font-medium">{item}</span>
					</button>
				</li>
			{/each}
		</ul>
	</nav>

	<div class="p-4 border-t border-purple-500/20">
		<button
			onclick={handleLogout}
			class="w-full px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-red-600/20 hover:to-red-500/20 rounded-xl transition-all duration-300 flex items-center space-x-3 group"
		>
			<svg class="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
			</svg>
			<span class="font-medium">Sign Out</span>
		</button>
	</div>
</aside>
