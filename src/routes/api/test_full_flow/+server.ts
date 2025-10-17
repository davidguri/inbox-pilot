import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase/supabase';

import { classifyIntent } from '$lib/api/classify.api';
import { classifyUrgencyFull } from '$lib/api/sentiment.api';
import { createReplyDraftForLead } from '$lib/drafts/reply.draft';

// minimal inline helpers (org check, client upsert, lead insert)
async function assertOrg(org_id: string) {
  const { data, error } = await supabase.from('organizations').select('id').eq('id', org_id).maybeSingle();
  if (error) throw new Error(`organizations.select: ${error.message}`);
  if (!data) throw new Error('organization not found');
}

async function upsertClientForEmail(org_id: string, email: string, name?: string | null) {
  // try by (org_id, email)
  const { data: existing, error: selErr } = await supabase
    .from('clients')
    .select('id, name, email')
    .eq('org_id', org_id)
    .eq('email', email)
    .maybeSingle();
  if (selErr) throw new Error(`clients.select: ${selErr.message}`);
  if (existing) return existing;

  // insert new
  const { data: inserted, error: insErr } = await supabase
    .from('clients')
    .insert({ org_id, email, name: name ?? null })
    .select('id, name, email')
    .single();
  if (insErr) throw new Error(`clients.insert: ${insErr.message}`);
  return inserted!;
}

async function insertLead(params: {
  org_id: string;
  client_id: string | null;
  subject?: string | null;
  text: string;
}) {
  const { data, error } = await supabase
    .from('leads')
    .insert({
      org_id: params.org_id,
      client_id: params.client_id,
      source: 'email',
      external_id: null,
      subject: params.subject ?? null,
      raw_text: params.text
    })
    .select('id, org_id, client_id, subject, raw_text')
    .single();
  if (error) throw new Error(`leads.insert: ${error.message}`);
  return data!;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({} as any));

    // Inputs (org required; others have defaults)
    const org_id = String(body.org_id || '').trim();
    const fromMail = body.from_email ? String(body.from_email) : 'ana@example.com';
    const fromName = body.from_name ? String(body.from_name) : 'Ana Dervishi';
    const subject = body.subject ? String(body.subject) : 'Kërkesë për ofertë';
    const text = body.text ? String(body.text) : 'Përshëndetje! Duam një faqe prezantuese dhe blog brenda dy javësh. Buxheti është gati.';
    const createDraft = Boolean(body.create_draft ?? true);

    if (!org_id) {
      return json({ ok: false, error: 'Provide { org_id }' }, { status: 400 });
    }

    // 1) sanity-check org
    await assertOrg(org_id);

    // 2) client upsert by (org_id, email)
    const client = await upsertClientForEmail(org_id, fromMail, fromName);

    // 3) create lead linked to client
    const lead = await insertLead({ org_id, client_id: client.id, subject, text });

    // 4) classify
    const intent = await classifyIntent(text); // 'sales' | 'support' | 'spam'
    const ufull = await classifyUrgencyFull(text); // { urgency, score, reasons, sentiment }

    // 5) update lead with classification
    const { data: updated, error: updErr } = await supabase
      .from('leads')
      .update({
        intent,
        urgency: ufull.urgency,
        urgency_score: ufull.score,
        urgency_reasons: ufull.reasons,
        sentiment: ufull.sentiment
      })
      .eq('id', lead.id)
      .select('id, org_id, client_id, subject, raw_text, intent, urgency, urgency_score, urgency_reasons, sentiment')
      .single();
    if (updErr) throw new Error(`leads.update: ${updErr.message}`);

    // 6) optionally create a reply draft
    let draft: any = null;
    if (createDraft) {
      try {
        draft = await createReplyDraftForLead(lead.id);
      } catch (e) {
        // non-fatal for the test flow
        draft = { error: String((e as any)?.message || e) };
      }
    }

    // 7) return a compact payload ready for UI
    return json({
      ok: true,
      client: { id: client.id, name: client.name, email: client.email },
      lead: updated,
      draft
    });
  } catch (e: any) {
    console.error('[test_full_flow] ERROR:', e);
    return json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
};
