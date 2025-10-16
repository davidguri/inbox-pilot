<script lang="ts">
	export let title: string;
</script>

<section class="widget">
	<h2>{title}</h2>
	<div class="content">
		<slot />
	</div>
</section>

<style>
	.widget {
		background: white;
		border-radius: 8px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		padding: 1.5rem;
		margin-bottom: 1.5rem;
	}

	.widget h2 {
		font-size: 1.25rem;
		margin-bottom: 1rem;
	}

	.content {
		font-size: 1rem;
		color: #333;
	}
</style>
