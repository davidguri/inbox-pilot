<script lang="ts">
	const navItems = ['Inbox Pilot', 'Clients', 'Contracts', 'Invoices', 'Settings'];
</script>

<nav class="sidebar">
	<ul>
		{#each navItems as item}
			<li><a href="#">{item}</a></li>
		{/each}
	</ul>
</nav>

<style>
	.sidebar {
		width: 250px;
		background-color: #f8f9fa;
		padding: 1rem;
		box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
	}
	.sidebar ul {
		list-style: none;
		padding: 0;
	}
	.sidebar li {
		margin: 1rem 0;
	}
	.sidebar a {
		text-decoration: none;
		color: #333;
		font-weight: bold;
	}
</style>
