<script lang="ts">
	import Listings from '$lib/components/Listings.svelte';
	import MostActive from '$lib/components/MostActive.svelte';
	import Recents from '$lib/components/Recents.svelte';
	import ClientCard from '$lib/components/ClientCard.svelte';
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<div class="dashboard-grid">
	<Listings />
	<MostActive />
	<Recents />
</div>

<ClientCard />

<style>
	.dashboard-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1rem;
		padding: 1rem;
	}
</style>
