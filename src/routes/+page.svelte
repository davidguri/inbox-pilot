<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	// Check if user is authenticated
	$: isAuthenticated = !!$page.data.user;

	function handleGetStarted() {
		if (isAuthenticated) {
			goto('/dashboard');
		} else {
			goto('/signup');
		}
	}

	let scrollY = 0;
	onMount(() => {
		const handleScroll = () => {
			scrollY = window.scrollY;
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	});
</script>

<svelte:head>
	<title>InboxPilot - AI-Powered Email Intelligence</title>
	<meta name="description" content="Transform your inbox into actionable intelligence with AI-powered email classification, lead tracking, and automated CRM." />
</svelte:head>

<!-- Navigation -->
<nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-300" style="background: {scrollY > 50 ? 'rgba(15, 15, 30, 0.95)' : 'transparent'}; backdrop-filter: {scrollY > 50 ? 'blur(20px)' : 'none'}; border-bottom: {scrollY > 50 ? '1px solid rgba(139, 92, 246, 0.1)' : 'none'};">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between h-16 sm:h-20">
			<div class="flex items-center space-x-3">
				<div class="h-10 w-10 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center glow-primary shadow-lg">
					<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
					</svg>
				</div>
				<span class="text-xl font-bold text-white modern-heading">InboxPilot</span>
			</div>
			
			<div class="flex items-center space-x-4">
				{#if !isAuthenticated}
					<a href="/login" class="text-gray-300 hover:text-purple-300 transition-colors px-4 py-2 text-sm font-medium hidden sm:block">
						Sign In
					</a>
					<button
						on:click={handleGetStarted}
						class="btn-primary px-6 py-2.5 text-sm font-medium rounded-xl"
					>
						Get Started
					</button>
				{:else}
					<button
						on:click={handleGetStarted}
						class="btn-primary px-6 py-2.5 text-sm font-medium rounded-xl"
					>
						Go to Dashboard
					</button>
				{/if}
			</div>
		</div>
	</div>
</nav>

<!-- Hero Section -->
<div class="relative min-h-screen flex items-center pt-20 overflow-hidden">
	<!-- Animated Background -->
	<div class="absolute inset-0 bg-gradient-to-br from-gray-950 via-purple-950/30 to-black"></div>
	<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
	<div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4YjVjZjYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
	
	<!-- Gradient orbs -->
	<div class="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
	<div class="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>

	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
			<!-- Left side - Content -->
			<div class="text-center lg:text-left space-y-8">
				<div class="inline-block">
					<span class="inline-flex items-center px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm font-medium backdrop-blur-sm">
						<svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
							<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
						</svg>
						AI-Powered Intelligence
					</span>
				</div>
				
				<h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight modern-heading">
					Transform Your
					<span class="gradient-text block mt-2">Inbox Into Action</span>
				</h1>
				
				<p class="text-xl text-gray-400 max-w-2xl modern-subheading leading-relaxed">
					Harness the power of AI to automatically classify emails, track leads, and manage customer relationships—all in one intelligent platform.
				</p>

				<div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
					<button
						on:click={handleGetStarted}
						class="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl btn-primary overflow-hidden"
					>
						<span class="relative z-10 flex items-center">
							{#if isAuthenticated}
								Go to Dashboard
							{:else}
								Start Free Trial
							{/if}
							<svg class="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
							</svg>
						</span>
					</button>

					{#if !isAuthenticated}
						<a
							href="/login"
							class="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl text-white border-2 border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/10 transition-all duration-300 backdrop-blur-sm"
						>
							Sign In
						</a>
					{/if}
				</div>

				<!-- Stats -->
				<div class="grid grid-cols-3 gap-8 pt-8 max-w-lg mx-auto lg:mx-0">
					<div class="text-center lg:text-left">
						<div class="text-3xl font-bold gradient-text">99%</div>
						<div class="text-sm text-gray-500 mt-1">Accuracy</div>
					</div>
					<div class="text-center lg:text-left">
						<div class="text-3xl font-bold gradient-text">50k+</div>
						<div class="text-sm text-gray-500 mt-1">Users</div>
					</div>
					<div class="text-center lg:text-left">
						<div class="text-3xl font-bold gradient-text">24/7</div>
						<div class="text-sm text-gray-500 mt-1">Support</div>
					</div>
				</div>
			</div>

			<!-- Right side - Visual -->
			<div class="relative lg:mt-0">
				<!-- Main Dashboard Preview -->
				<div class="relative modern-card p-6 sm:p-8 border-purple-500/20">
					<div class="flex items-center justify-between mb-6">
						<div class="flex items-center space-x-3">
							<div class="h-10 w-10 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 rounded-lg glow-primary"></div>
							<div>
								<div class="text-sm text-gray-400">Dashboard</div>
								<div class="text-lg font-semibold text-white">Live Activity</div>
							</div>
						</div>
						<div class="flex space-x-2">
							<div class="w-3 h-3 rounded-full bg-red-500/50"></div>
							<div class="w-3 h-3 rounded-full bg-yellow-500/50"></div>
							<div class="w-3 h-3 rounded-full bg-green-500/50 animate-pulse"></div>
						</div>
					</div>

					<div class="space-y-4">
						<div class="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-900/20 to-transparent border border-purple-500/20 hover:border-purple-500/40 transition-all">
							<div class="flex items-center space-x-3">
								<div class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
								<span class="text-white text-sm font-medium">New Lead Detected</span>
							</div>
							<span class="text-xs text-purple-300">2m ago</span>
						</div>
						
						<div class="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-900/20 to-transparent border border-purple-500/20 hover:border-purple-500/40 transition-all">
							<div class="flex items-center space-x-3">
								<div class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
								<span class="text-white text-sm font-medium">Email Classified</span>
							</div>
							<span class="text-xs text-purple-300">5m ago</span>
						</div>
						
						<div class="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-900/20 to-transparent border border-purple-500/20 hover:border-purple-500/40 transition-all">
							<div class="flex items-center space-x-3">
								<div class="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
								<span class="text-white text-sm font-medium">Client Updated</span>
							</div>
							<span class="text-xs text-purple-300">12m ago</span>
						</div>
					</div>
				</div>

				<!-- Floating Elements -->
				<div class="absolute -top-6 -right-6 modern-card p-4 float-animation hidden sm:block border-purple-500/20">
					<div class="flex items-center space-x-2">
						<div class="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
							<svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
								<path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
								<path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
							</svg>
						</div>
						<div>
							<div class="text-xs text-gray-400">Inbox</div>
							<div class="text-sm font-bold text-white">247</div>
						</div>
					</div>
				</div>

				<div class="absolute -bottom-6 -left-6 modern-card p-4 float-animation hidden sm:block border-purple-500/20" style="animation-delay: 2s;">
					<div class="flex items-center space-x-2">
						<div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg glow-primary">
							<svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
								<path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
								<path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
							</svg>
						</div>
						<div>
							<div class="text-xs text-gray-400">Leads</div>
							<div class="text-sm font-bold text-white">89</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Features Section -->
<div class="py-20 sm:py-32 relative overflow-hidden">
	<!-- Background decoration -->
	<div class="absolute inset-0 bg-gradient-to-b from-black via-purple-950/20 to-black"></div>
	<div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4YjVjZjYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
	
	<!-- Accent gradient orbs -->
	<div class="absolute top-1/2 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
	<div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>

	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
		<div class="text-center mb-16 sm:mb-20">
			<span class="inline-flex items-center px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm font-medium mb-6 backdrop-blur-sm">
				Powerful Features
			</span>
			<h2 class="text-4xl sm:text-5xl font-bold text-white modern-heading mb-6">
				Everything You Need to 
				<span class="gradient-text">Master Your Inbox</span>
			</h2>
			<p class="text-xl text-gray-400 max-w-3xl mx-auto modern-subheading">
				Powerful AI-driven features that transform emails into actionable business intelligence
			</p>
		</div>

		<div class="grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
			<!-- Feature 1 -->
			<div class="group relative modern-widget p-8 border border-purple-500/10 hover:border-purple-500/30 hover:scale-[1.02] transition-all duration-300">
				<div class="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
				<div class="relative">
					<div class="h-14 w-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 mb-6 group-hover:scale-110 transition-transform">
						<svg class="h-7 w-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
						</svg>
					</div>
					<h3 class="text-xl font-bold text-white modern-heading mb-3">Smart Classification</h3>
					<p class="text-gray-400 leading-relaxed">
						AI-powered email classification that automatically categorizes sales, support, and spam emails with 99% accuracy
					</p>
				</div>
			</div>

			<!-- Feature 2 -->
			<div class="group relative modern-widget p-8 border border-purple-500/10 hover:border-cyan-500/30 hover:scale-[1.02] transition-all duration-300">
				<div class="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
				<div class="relative">
					<div class="h-14 w-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 mb-6 group-hover:scale-110 transition-transform">
						<svg class="h-7 w-7 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
						</svg>
					</div>
					<h3 class="text-xl font-bold text-white modern-heading mb-3">Lead Management</h3>
					<p class="text-gray-400 leading-relaxed">
						Automatically capture and track leads from incoming emails with intelligent lead scoring and priority ranking
					</p>
				</div>
			</div>

			<!-- Feature 3 -->
			<div class="group relative modern-widget p-8 border border-purple-500/10 hover:border-indigo-500/30 hover:scale-[1.02] transition-all duration-300">
				<div class="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
				<div class="relative">
					<div class="h-14 w-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 mb-6 group-hover:scale-110 transition-transform">
						<svg class="h-7 w-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
					</div>
					<h3 class="text-xl font-bold text-white modern-heading mb-3">Client Profiles</h3>
					<p class="text-gray-400 leading-relaxed">
						Build comprehensive client profiles from email interactions and manage relationships with deep insights
					</p>
				</div>
			</div>

			<!-- Feature 4 -->
			<div class="group relative modern-widget p-8 border border-purple-500/10 hover:border-green-500/30 hover:scale-[1.02] transition-all duration-300">
				<div class="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
				<div class="relative">
					<div class="h-14 w-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 mb-6 group-hover:scale-110 transition-transform">
						<svg class="h-7 w-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
						</svg>
					</div>
					<h3 class="text-xl font-bold text-white modern-heading mb-3">Real-time Dashboard</h3>
					<p class="text-gray-400 leading-relaxed">
						Get instant insights with live dashboards showing leads, clients, and activity metrics in real-time
					</p>
				</div>
			</div>

			<!-- Feature 5 -->
			<div class="group relative modern-widget p-8 border border-purple-500/10 hover:border-blue-500/30 hover:scale-[1.02] transition-all duration-300">
				<div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
				<div class="relative">
					<div class="h-14 w-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 mb-6 group-hover:scale-110 transition-transform">
						<svg class="h-7 w-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<h3 class="text-xl font-bold text-white modern-heading mb-3">Automated Workflows</h3>
					<p class="text-gray-400 leading-relaxed">
						Set up intelligent automated responses and workflows based on email content and sender behavior patterns
					</p>
				</div>
			</div>

			<!-- Feature 6 -->
			<div class="group relative modern-widget p-8 border border-purple-500/10 hover:border-pink-500/30 hover:scale-[1.02] transition-all duration-300">
				<div class="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
				<div class="relative">
					<div class="h-14 w-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/20 to-pink-600/20 mb-6 group-hover:scale-110 transition-transform">
						<svg class="h-7 w-7 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
						</svg>
					</div>
					<h3 class="text-xl font-bold text-white modern-heading mb-3">Team Collaboration</h3>
					<p class="text-gray-400 leading-relaxed">
						Share insights and collaborate seamlessly with your team on lead management and client relationships
					</p>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- CTA Section -->
<div class="relative py-20 sm:py-32 overflow-hidden">
	<div class="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800"></div>
	<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-400/20 via-transparent to-transparent"></div>
	<div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
	
	<!-- Animated gradient orbs -->
	<div class="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse"></div>
	<div class="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>

	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
		<div class="text-center">
			<h2 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white modern-heading mb-6">
				Ready to Transform <br class="hidden sm:block" />Your Email Workflow?
			</h2>
			<p class="text-xl sm:text-2xl text-purple-100 max-w-3xl mx-auto mb-12 leading-relaxed">
				Join thousands of professionals who trust InboxPilot to intelligently manage 
				their inbox and accelerate business growth.
			</p>

			<div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
				<button
					on:click={handleGetStarted}
					class="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl bg-white text-purple-600 hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105"
				>
					<span class="flex items-center">
						{#if isAuthenticated}
							Go to Dashboard
						{:else}
							Start Free Trial
						{/if}
						<svg class="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
						</svg>
					</span>
				</button>
				
				{#if !isAuthenticated}
					<a
						href="/login"
						class="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl text-white border-2 border-white/30 hover:border-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
					>
						Sign In
					</a>
				{/if}
			</div>

			<p class="mt-8 text-purple-100/80 text-sm">
				No credit card required • Free 14-day trial • Cancel anytime
			</p>
		</div>
	</div>
</div>

<!-- Footer -->
<footer class="bg-black py-12 border-t border-purple-900/30">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex flex-col md:flex-row items-center justify-between">
			<div class="flex items-center space-x-3 mb-4 md:mb-0">
				<div class="h-10 w-10 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center glow-primary shadow-lg">
					<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
					</svg>
				</div>
				<span class="text-xl font-bold text-white modern-heading">InboxPilot</span>
			</div>
			
			<div class="text-gray-400 text-sm">
				© 2025 InboxPilot. All rights reserved.
			</div>
		</div>
	</div>
</footer>
