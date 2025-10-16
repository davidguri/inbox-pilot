import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

// Create Supabase admin client for server-side operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
	auth: { persistSession: false }
});

export const handle: Handle = async ({ event, resolve }) => {
	// Get the current session from the request
	const accessToken = event.cookies.get('sb-access-token');
	const refreshToken = event.cookies.get('sb-refresh-token');

	if (accessToken && refreshToken) {
		const { data, error } = await supabase.auth.setSession({
			access_token: accessToken,
			refresh_token: refreshToken
		});

		if (data.session) {
			event.locals.user = data.session.user;
			event.locals.session = data.session;
		}
	}

	// Protect dashboard routes
	if (event.url.pathname.startsWith('/dashboard') || event.url.pathname.startsWith('/clients') || event.url.pathname.startsWith('/leads') || event.url.pathname.startsWith('/contracts') || event.url.pathname.startsWith('/settings')) {
		if (!event.locals.user) {
			return new Response('Redirect', { status: 302, headers: { Location: '/login' } });
		}
	}

	// Redirect authenticated users away from auth pages
	if (event.url.pathname === '/login' || event.url.pathname === '/signup') {
		if (event.locals.user) {
			return new Response('Redirect', { status: 302, headers: { Location: '/dashboard' } });
		}
	}

	// Redirect root path to dashboard for authenticated users
	if (event.url.pathname === '/' && event.locals.user) {
		return new Response('Redirect', { status: 302, headers: { Location: '/dashboard' } });
	}

	// Handle paraglide middleware
	return paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});
};
