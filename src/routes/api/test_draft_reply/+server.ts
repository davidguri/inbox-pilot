import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

import { createReplyDraftForLead } from '$lib/drafts/reply.draft';
import { supabase } from '../../../supabase/supabase';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const b = await request.json().catch(() => ({}));
    const lead_id = String(b.lead_id || '').trim();
    const org_id = b.org_id ? String(b.org_id).trim() : '';

    if (!lead_id) {
      return json({ ok: false, error: 'Provide { lead_id }' }, { status: 400 });
    }

    // Optional org guard
    if (org_id) {
      const { data: lead, error } = await supabase
        .from('leads')
        .select('id, org_id')
        .eq('id', lead_id)
        .maybeSingle();
      if (error) return json({ ok: false, error: error.message }, { status: 500 });
      if (!lead) return json({ ok: false, error: 'Lead not found' }, { status: 404 });
      if (lead.org_id !== org_id) return json({ ok: false, error: 'Lead not in org' }, { status: 403 });
    }

    const draft = await createReplyDraftForLead(lead_id);
    return json({
      ok: true,
      draft_id: draft.id,
      body: draft.content?.body,
      created_at: draft.created_at
    });
  } catch (e: any) {
    console.error('[test_reply_draft] ERROR:', e);
    return json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
};
