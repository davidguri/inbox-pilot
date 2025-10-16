<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	// Check if user is authenticated
	$: isAuthenticated = !!$page.data.user;

	function handleGetStarted() {
		if (isAuthenticated) {
			goto('/dashboard');
		} else {
			goto('/signup');
		}
	}
</script>

<svelte:head>
	<title>InboxPilot - Smart Email Management</title>
</svelte:head>

<!-- Hero Section -->
<div class="bg-gradient-to-br from-blue-50 to-indigo-100">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex flex-col lg:flex-row items-center justify-between py-12 lg:py-20">
			<!-- Left side - Content -->
			<div class="lg:w-1/2 lg:pr-12">
				<h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
					Smart Email
					<span class="text-indigo-600">Management</span>
					for Modern Teams
				</h1>
				<p class="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl">
					Transform your inbox into a powerful lead generation and customer management system.
					Automate email classification, track leads, and manage client relationships effortlessly.
				</p>

				<div class="mt-8 flex flex-col sm:flex-row gap-4">
					<button
						on:click={handleGetStarted}
						class="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
					>
						{#if isAuthenticated}
							Go to Dashboard
						{:else}
							Get Started Free
						{/if}
					</button>

					{#if !isAuthenticated}
						<a
							href="/login"
							class="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
						>
							Sign In
						</a>
					{/if}
				</div>
			</div>

			<!-- Right side - Visual -->
			<div class="lg:w-1/2 mt-12 lg:mt-0">
				<div class="relative">
					<div class="bg-white rounded-lg shadow-xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
						<div class="space-y-4">
							<div class="flex items-center space-x-3">
								<div class="w-3 h-3 bg-green-400 rounded-full"></div>
								<div class="text-sm font-medium text-gray-900">New lead detected</div>
							</div>
							<div class="flex items-center space-x-3">
								<div class="w-3 h-3 bg-blue-400 rounded-full"></div>
								<div class="text-sm font-medium text-gray-900">Email classified as sales inquiry</div>
							</div>
							<div class="flex items-center space-x-3">
								<div class="w-3 h-3 bg-purple-400 rounded-full"></div>
								<div class="text-sm font-medium text-gray-900">Client profile created</div>
							</div>
						</div>
					</div>

					<!-- Floating cards -->
					<div class="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-4 transform -rotate-6">
						<div class="text-2xl">📧</div>
						<div class="text-sm font-medium text-gray-900 mt-1">InboxPilot</div>
					</div>

					<div class="absolute -bottom-4 -left-4 bg-indigo-600 text-white rounded-lg shadow-lg p-4 transform rotate-6">
						<div class="text-sm font-medium">Dashboard</div>
						<div class="text-xs opacity-90">Real-time insights</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Features Section -->
<div class="py-16 bg-white">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center">
			<h2 class="text-3xl font-bold text-gray-900 sm:text-4xl">
				Everything you need to manage your inbox
			</h2>
			<p class="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
				Powerful features that help you turn emails into actionable business insights
			</p>
		</div>

		<div class="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
			<!-- Feature 1 -->
			<div class="text-center">
				<div class="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-indigo-100">
					<svg class="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
					</svg>
				</div>
				<h3 class="mt-4 text-lg font-medium text-gray-900">Smart Classification</h3>
				<p class="mt-2 text-base text-gray-600">
					AI-powered email classification that automatically categorizes sales, support, and spam emails
				</p>
			</div>

			<!-- Feature 2 -->
			<div class="text-center">
				<div class="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-indigo-100">
					<svg class="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
					</svg>
				</div>
				<h3 class="mt-4 text-lg font-medium text-gray-900">Lead Management</h3>
				<p class="mt-2 text-base text-gray-600">
					Automatically capture and track leads from incoming emails with intelligent lead scoring
				</p>
			</div>

			<!-- Feature 3 -->
			<div class="text-center">
				<div class="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-indigo-100">
					<svg class="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
				</div>
				<h3 class="mt-4 text-lg font-medium text-gray-900">Client Profiles</h3>
				<p class="mt-2 text-base text-gray-600">
					Build comprehensive client profiles from email interactions and manage relationships effectively
				</p>
			</div>

			<!-- Feature 4 -->
			<div class="text-center">
				<div class="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-indigo-100">
					<svg class="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
				</div>
				<h3 class="mt-4 text-lg font-medium text-gray-900">Real-time Dashboard</h3>
				<p class="mt-2 text-base text-gray-600">
					Get instant insights with live dashboards showing leads, clients, and activity metrics
				</p>
			</div>

			<!-- Feature 5 -->
			<div class="text-center">
				<div class="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-indigo-100">
					<svg class="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<h3 class="mt-4 text-lg font-medium text-gray-900">Automated Workflows</h3>
				<p class="mt-2 text-base text-gray-600">
					Set up automated responses and workflows based on email content and sender behavior
				</p>
			</div>

			<!-- Feature 6 -->
			<div class="text-center">
				<div class="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-indigo-100">
					<svg class="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<h3 class="mt-4 text-lg font-medium text-gray-900">Team Collaboration</h3>
				<p class="mt-2 text-base text-gray-600">
					Share insights and collaborate with your team on lead management and client relationships
				</p>
			</div>
		</div>
	</div>
</div>

<!-- CTA Section -->
<div class="bg-indigo-600">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
		<div class="text-center">
			<h2 class="text-3xl font-bold text-white sm:text-4xl">
				Ready to transform your inbox?
			</h2>
			<p class="mt-4 text-lg text-indigo-100 max-w-2xl mx-auto">
				Join thousands of professionals who are already using InboxPilot to manage their email workflow more efficiently.
			</p>

			<div class="mt-8">
				<button
					on:click={handleGetStarted}
					class="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 transition-colors duration-200"
				>
					{#if isAuthenticated}
						Go to Dashboard
					{:else}
						Get Started Free
					{/if}
				</button>
			</div>
		</div>
	</div>
</div>
