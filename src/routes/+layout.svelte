<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Sidebar from '../components/Sidebar.svelte';
	import Widget from '../components/Widget.svelte';

	let navigation = ["Inbox Pilot", "Clients", "Contracts", "Invoices"];
	let settings = "Settings";
	let listings = [
		{ name: "Client A", status: "Lead" },
		{ name: "Client B", status: "Active" },
		{ name: "Client C", status: "Inactive" }
	];
	let mostActive = { name: "Client B", activity: "15 interactions" };
	let recentFiles = [
		{ name: "Proposal.pdf", url: "/downloads/Proposal.pdf" },
		{ name: "Contract.docx", url: "/downloads/Contract.docx" },
		{ name: "Invoice.xlsx", url: "/downloads/Invoice.xlsx" }
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>InboxPilot Dashboard</title>
</svelte:head>

<div class="layout">
	<Sidebar {navigation} {settings} />
	<main class="dashboard">
		<Widget title="Listings">
			<ul>
				{#each listings as listing}
					<li class="flex items-center justify-between">
						<span>{listing.name}</span>
						<span class="status">{listing.status}</span>
					</li>
				{/each}
			</ul>
		</Widget>
		<Widget title="Most Active This Month">
			<p class="font-bold">{mostActive.name}</p>
			<p class="text-gray-500">{mostActive.activity}</p>
		</Widget>
		<Widget title="Downloadable Files">
			<ul>
				{#each recentFiles as file}
					<li>
						<a href={file.url} download>{file.name}</a>
					</li>
				{/each}
			</ul>
		</Widget>
	</main>
</div>

<style>
	.layout {
		display: flex;
		height: 100vh;
		font-family: 'Inter', sans-serif;
		background-color: #f9fafb;
		color: #333;
	}

	.dashboard {
		flex: 1;
		padding: 2rem;
		overflow-y: auto;
	}

	.status {
		font-size: 0.875rem;
		color: #6b7280;
	}
</style>
