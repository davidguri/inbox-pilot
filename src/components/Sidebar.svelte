<script lang="ts">
	export let navigation: string[] = [];
	export let settings: string = "Settings";
</script>

<aside class="sidebar">
	<h1>InboxPilot</h1>
	<nav class="navigation">
		{#each navigation as item}
			<button class="nav-button">{item}</button>
		{/each}
	</nav>
	<div class="settings">
		<button class="settings-button">{settings}</button>
	</div>
</aside>

<style>
	.sidebar {
		width: 250px;
		background-color: #1f2937;
		color: white;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
	}

	.sidebar h1 {
		font-size: 1.5rem;
		margin-bottom: 1rem;
	}

	.nav-button,
	.settings-button {
		display: block;
		width: 100%;
		color: #9ca3af;
		background: none;
		border: none;
		text-align: left;
		padding: 0.5rem 0;
		border-radius: 4px;
		cursor: pointer;
	}

	.nav-button:hover,
	.settings-button:hover {
		background-color: #374151;
		color: white;
	}
</style>
