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

	// Icon mapping for navigation items
	const icons: Record<string, string> = {
		dashboard: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
		clients: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
		contracts: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
		leads: 'M13 10V3L4 14h7v7l9-11h-7z',
		settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'
	};

	function getIcon(item: string): string {
		return icons[item] || 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
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
						<svg class="h-5 w-5 text-purple-400 group-hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={getIcon(item)} />
						</svg>
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
