<script lang="ts">
  import { goto } from '$app/navigation';

  // Form state
  let fullName = '';
  let organizationName = '';
  let email = '';
  let password = '';
  let confirmPassword = '';

  // UI state
  let loading = false;
  let error: string | null = null;

  function validate(): string | null {
    if (!fullName || fullName.trim().length < 2) return 'Full name is required';
    if (!organizationName || organizationName.trim().length < 2) return 'Organization name is required';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Valid email is required';
    if (!password || password.length < 6) return 'Password must be ≥ 6 characters';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  }

  async function handleSignup() {
    if (loading) return;
    error = null;
    const v = validate();
    if (v) { error = v; return; }

    loading = true;
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          org_name: organizationName.trim()
        })
      });
      const j = await res.json().catch(() => ({}));

      if (!res.ok || !j.ok) {
        throw new Error(j?.error || `Signup failed (${res.status})`);
      }

      // If email confirmation is enabled, redirect to login w/ message
      goto('/login?message=' + encodeURIComponent('Account created. Check your email to confirm.'));
    } catch (e: any) {
      error = String(e?.message || e || 'Signup failed');
    } finally {
      loading = false;
    }
  }

  function onSubmit(e: Event) {
    e.preventDefault();
    handleSignup();
  }

  function clearError() {
    error = null;
  }
</script>

<svelte:head>
  <title>Sign Up - InboxPilot</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
  <div class="w-full max-w-md space-y-8">
    <div class="text-center">
      <h2 class="mt-6 text-3xl font-extrabold text-gray-900">Create your account</h2>
      <p class="mt-2 text-sm text-gray-600">
        Or
        <a href="/login" class="font-medium text-indigo-600 transition-colors hover:text-indigo-500">
          sign in to existing account
        </a>
      </p>
    </div>

    {#if error}
      <div class="rounded-md border border-red-200 bg-red-50 p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <svg class="mr-2 h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h3 class="text-sm font-medium text-red-800">{error}</h3>
          </div>
          <button type="button" on:click={clearError} class="text-red-400 hover:text-red-600" aria-label="Close">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    {/if}

    <form class="mt-8 space-y-6" on:submit={onSubmit}>
      <div class="space-y-4">
        <!-- Full Name -->
        <div>
          <label for="fullName" class="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autocomplete="name"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter your full name"
            bind:value={fullName}
            disabled={loading}
          />
        </div>

        <!-- Organization Name -->
        <div>
          <label for="organizationName" class="block text-sm font-medium text-gray-700">Organization Name</label>
          <input
            id="organizationName"
            name="organizationName"
            type="text"
            autocomplete="organization"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter your organization name"
            bind:value={organizationName}
            disabled={loading}
          />
        </div>

        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            placeholder="you@example.com"
            bind:value={email}
            disabled={loading}
          />
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autocomplete="new-password"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            placeholder="Min 6 characters"
            bind:value={password}
            disabled={loading}
          />
        </div>

        <!-- Confirm Password -->
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autocomplete="new-password"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            placeholder="Re-enter your password"
            bind:value={confirmPassword}
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          class="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {#if loading}
            <svg class="mr-3 -ml-1 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Creating account...
          {:else}
            Create account
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>
