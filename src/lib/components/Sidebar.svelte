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

<aside class="w-64 bg-gray-900 text-white flex flex-col h-full">
	<div class="p-6 border-b border-gray-700">
		<h1 class="text-2xl font-bold text-white">InboxPilot</h1>
		<p class="text-sm text-gray-400 mt-1">Smart Email Management</p>
	</div>

	<nav class="flex-1 p-4">
		<ul class="space-y-2">
			{#each navigation as item}
				<li>
					<button
						class="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-800 hover:text-indigo-300 transition-colors duration-200 flex items-center space-x-3"
						onclick={() => navigateTo(item)}
					>
						<span class="capitalize font-medium">{item}</span>
					</button>
				</li>
			{/each}
		</ul>
	</nav>

	<div class="p-4 border-t border-gray-700">
		<button
			onclick={handleLogout}
			class="w-full px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors duration-200"
		>
			Sign Out
		</button>
	</div>
</aside>
