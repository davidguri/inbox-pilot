// src/routes/api/sandbox/+server.ts
import { json, type RequestHandler } from '@sveltejs/kit';
import { supabase } from '../../../supabase/supabase';

export const GET: RequestHandler = async () => {
  const { data, error } = await supabase.from('sandbox').select('*').order('created_at', { ascending: false });
  if (error) return json({ ok: false, error: error.message }, { status: 400 });
  return json({ ok: true, data });
};

export const POST: RequestHandler = async ({ request }) => {
  const { note } = await request.json();
  const { error } = await supabase.from('sandbox').insert({ note });
  if (error) return json({ ok: false, error: error.message }, { status: 400 });
  return json({ ok: true });
};