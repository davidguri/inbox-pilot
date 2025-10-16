import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

import { SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: true } });

// Minimal inline versions (avoid importing client-side modules)
async function ensureProfile(userId: string, email: string, fullName: string) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, email, full_name: fullName }, { onConflict: 'id' })
    .select('id, email, full_name')
    .single();
  if (error) throw new Error(error.message);
  return data;
}

async function upsertOrganization({ name, owner_user_id }: { name: string; owner_user_id: string; }) {
  // slug naive
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'org';
  const { data, error } = await supabase
    .from('organizations')
    .insert({ name, slug })
    .select('id')
    .single();
  if (error) throw new Error(error.message);

  // add owner member
  const insMember = await supabase
    .from('organization_members')
    .insert({ org_id: data.id, user_id: owner_user_id, role: 'owner' });
  if (insMember.error) throw new Error(insMember.error.message);

  return data;
}

async function setDefaultOrg(userId: string, orgId: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ default_org_id: orgId })
    .eq('id', userId);
  if (error) throw new Error(error.message);
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { email, password, full_name, org_name } = await request.json();

    if (!email || !password || !full_name || !org_name) {
      return json({ ok: false, error: 'email, password, full_name, org_name are required' }, { status: 400 });
    }

    // 1) Create auth user (server-side, needs service role)
    const { data: created, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    if (authErr) return json({ ok: false, error: `auth.admin.createUser: ${authErr.message}` }, { status: 400 });
    const user = created.user;
    if (!user?.id) return json({ ok: false, error: 'No user id from auth' }, { status: 500 });

    // 2) Profile
    await ensureProfile(user.id, email, full_name);

    // 3) Org + owner membership
    const org = await upsertOrganization({ name: org_name, owner_user_id: user.id });

    // 4) Default org
    await setDefaultOrg(user.id, org.id);

    // NOTE: If email confirmation is required, user will still need to confirm before logging in.
    return json({ ok: true, user_id: user.id, org_id: org.id });
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
};
