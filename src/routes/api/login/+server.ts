import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase/supabase';

export const POST: RequestHandler = async ({ request, cookies, url }) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return json({ ok: false, error: 'email and password are required' }, { status: 400 });
    }

    // Sign in (server-side is fine; this uses the anon key)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return json({ ok: false, error: error.message }, { status: 401 });
    }

    const session = data.session;
    if (!session) {
      return json({ ok: false, error: 'No session returned' }, { status: 500 });
    }

    // Fetch user's profile to get their org_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('default_org_id')
      .eq('id', session.user.id)
      .single();

    // Set HttpOnly cookies for server-side session access (more secure than document.cookie)
    const isProd = url.hostname !== 'localhost' && !url.hostname.startsWith('127.');
    const week = 60 * 60 * 24 * 7;

    cookies.set('sb-access-token', session.access_token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      maxAge: week
    });

    cookies.set('sb-refresh-token', session.refresh_token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      maxAge: week
    });

    return json({
      ok: true,
      user: { id: session.user.id, email: session.user.email },
      orgId: profile?.default_org_id || null
    });
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
};
