import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase/supabase';

export const POST: RequestHandler = async ({ cookies, url }) => {
  try {
    // Get tokens from cookies before clearing them
    const accessToken = cookies.get('sb-access-token');
    const refreshToken = cookies.get('sb-refresh-token');

    // If we have tokens, sign out from Supabase (optional but good practice)
    if (accessToken && refreshToken) {
      await supabase.auth.signOut();
    }

    // Clear HttpOnly cookies
    const isProd = url.hostname !== 'localhost' && !url.hostname.startsWith('127.');

    cookies.set('sb-access-token', '', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      maxAge: 0, // This expires the cookie immediately
      expires: new Date(0) // Set to epoch time to expire immediately
    });

    cookies.set('sb-refresh-token', '', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      maxAge: 0,
      expires: new Date(0)
    });

    return json({
      ok: true,
      message: 'Successfully signed out'
    });
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
};
