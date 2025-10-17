import { supabase } from '$lib/supabase/supabase';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

export type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  default_org_id: string | null;
  created_at: string;
};

export async function createAuthUserDev(email: string, password: string) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(`auth.admin.createUser: ${error.message}`);
  if (!data.user?.id) throw new Error('User creation returned no user id');
  return data.user;
}

export async function ensureProfile(userId: string, email?: string | null, fullName?: string | null) {
  if (!userId) throw new Error('ensureProfile: userId required');

  const payload: Partial<ProfileRow> = { id: userId };
  if (email !== undefined) payload.email = email ?? null;
  if (fullName !== undefined) payload.full_name = fullName ?? null;

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as ProfileRow;
}

export async function setDefaultOrg(userId: string, orgId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ default_org_id: orgId })
    .eq('id', userId)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as ProfileRow;
}
