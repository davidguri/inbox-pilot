import { supabase } from '../../supabase/supabase';
import { slugify } from '$lib/utils/slugify.util';

export type OrgRow = {
  id: string;
  name: string;
  slug: string | null;
  owner_user_id: string | null;
  created_at: string;
};

type UpsertOrgInput = {
  name: string;
  owner_user_id: string;
  slug?: string | null;
};

export async function upsertOrganization(input: UpsertOrgInput): Promise<OrgRow> {
  const name = String(input.name || '').trim();
  if (!name) throw new Error('Organization name is required');
  const owner_user_id = String(input.owner_user_id || '').trim();
  if (!owner_user_id) throw new Error('owner_user_id is required');

  const desiredSlug = (input.slug ?? slugify(name)) || 'org';

  const { data: existing, error: selErr } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', desiredSlug)
    .maybeSingle();
  if (selErr) throw new Error(selErr.message);

  if (existing) {
    if (!existing.owner_user_id) {
      await supabase.from('organizations').update({ owner_user_id }).eq('id', existing.id);
    }
    return existing as OrgRow;
  }

  const { data: inserted, error: insErr } = await supabase
    .from('organizations')
    .insert({ name, slug: desiredSlug, owner_user_id })
    .select('*')
    .single();
  if (insErr) throw new Error(insErr.message);

  return inserted as OrgRow;
}
