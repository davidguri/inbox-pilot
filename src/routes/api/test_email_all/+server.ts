import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

// Adjust path if your supabase client lives elsewhere
import { supabase } from '../../../supabase/supabase';

// Reuse your existing helpers (paths match what you shared earlier)
import { classifyIntent } from '../inbound/classify.api';
import { classifyUrgencyFull } from '../inbound/sentiment.api';
import { createReplyDraftForLead } from '../../../lib/drafts/reply.draft';

type Body = {
  org_id: string;

  // "email" payload (defaults provided)
  message_id?: string | null;
  from_email?: string | null;
  from_name?: string | null;
  subject?: string | null;
  text?: string | null;
  html?: string | null;

  // optional source
  source?: 'email' | 'whatsapp' | 'web' | 'manual';

  // toggles
  classify?: boolean;   // default true
  draft?: boolean;      // default true

  // simple debug toggle
  debug?: boolean;
};

/** Upsert client by (org_id + email). Creates new if not found or no email. */
async function upsertClientByEmail(org_id: string, name?: string | null, email?: string | null) {
  const normalizedEmail = email?.toLowerCase().trim() || null;

  if (normalizedEmail) {
    const { data: existing, error: selErr } = await supabase
      .from('clients')
      .select('*')
      .eq('org_id', org_id)
      .eq('email', normalizedEmail)
      .maybeSingle();
    if (selErr) throw new Error(`clients.select: ${selErr.message}`);
    if (existing) return existing;
  }

  const { data, error } = await supabase
    .from('clients')
    .insert({ org_id, name: name ?? 'New Client', email: normalizedEmail })
    .select('*')
    .single();
  if (error) throw new Error(`clients.insert: ${error.message}`);
  return data!;
}

/** Find-or-insert lead by (org_id, source, external_id). Falls back to plain insert if no external_id. */
async function findOrInsertLead(params: {
  org_id: string;
  client_id: string;
  source: NonNullable<Body['source']>;
  external_id: string | null;
  subject: string | null;
  raw_text: string;
}) {
  const { org_id, client_id, source, external_id, subject, raw_text } = params;
  const baseLead = { org_id, client_id, source, external_id, subject, raw_text };

  if (external_id) {
    const found = await supabase
      .from('leads')
      .select('*')
      .eq('org_id', org_id)
      .eq('source', source)
      .eq('external_id', external_id)
      .maybeSingle();
    if (found.error) throw new Error(`leads.find: ${found.error.message}`);

    if (found.data) {
      const upd = await supabase
        .from('leads')
        .update(baseLead)
        .eq('id', found.data.id)
        .select('*')
        .single();
      if (upd.error) throw new Error(`leads.update: ${upd.error.message}`);
      return upd.data!;
    }
  }

  const ins = await supabase
    .from('leads')
    .insert(baseLead)
    .select('*')
    .single();
  if (ins.error) throw new Error(`leads.insert: ${ins.error.message}`);
  return ins.data!;
}

export const POST: RequestHandler = async ({ request }) => {
  const started = Date.now();
  try {
    const b = (await request.json().catch(() => ({}))) as Body;

    // ------- Inputs & defaults -------
    const org_id = String(b.org_id || '').trim();
    if (!org_id) return json({ ok: false, error: 'org_id is required' }, { status: 400 });

    const source = (b.source ?? 'email') as NonNullable<Body['source']>;
    const message_id = b.message_id ?? 'msg-test-001';
    const from_email = b.from_email ?? 'ana@example.com';
    const from_name = b.from_name ?? 'Ana Dervishi';
    const subject = b.subject ?? 'Kërkesë për ofertë';
    const textBody = (b.text ?? b.html ?? 'Përshëndetje! Duam një faqe prezantuese dhe blog brenda dy javësh. Buxheti është gati.').toString().trim();

    const doClassify = b.classify !== false;
    const doDraft = b.draft !== false;

    // ------- Verify org exists (fast check) -------
    {
      const { data, error } = await supabase.from('organizations').select('id').eq('id', org_id).maybeSingle();
      if (error) throw new Error(`organizations.select: ${error.message}`);
      if (!data) return json({ ok: false, error: 'organization not found' }, { status: 404 });
    }

    // ------- Client upsert -------
    const client = await upsertClientByEmail(org_id, from_name, from_email);

    // ------- Lead find/insert -------
    const lead = await findOrInsertLead({
      org_id,
      client_id: client.id,
      source,
      external_id: message_id,
      subject,
      raw_text: textBody
    });

    // ------- Classification -------
    let intent: 'sales' | 'support' | 'spam' | null = null;
    let urgency: 'low' | 'medium' | 'high' | null = null;
    let urgency_score: number | null = null;
    let urgency_reasons: string[] | null = null;
    let sentiment: 'negative' | 'neutral' | 'positive' | null = null;

    if (doClassify) {
      try {
        intent = await classifyIntent(textBody) as any;
        const u = await classifyUrgencyFull(textBody);
        urgency = u.urgency as any;
        urgency_score = u.score;
        urgency_reasons = u.reasons;
        sentiment = u.sentiment as any;

        const upd = await supabase
          .from('leads')
          .update({ intent, urgency, urgency_score, urgency_reasons, sentiment })
          .eq('id', lead.id);
        if (upd.error) throw new Error(`leads.update(tags): ${upd.error.message}`);
      } catch (e: any) {
        console.warn('[test_email_all] classification failed:', e?.message || e);
      }
    }

    // ------- Reply draft -------
    let draft: any = null;
    if (doDraft) {
      try {
        draft = await createReplyDraftForLead(lead.id);
      } catch (e: any) {
        console.warn('[test_email_all] draft failed:', e?.message || e);
      }
    }

    return json({
      ok: true,
      elapsed_ms: Date.now() - started,
      client: { id: client.id, name: client.name, email: client.email },
      lead: { id: lead.id, source: lead.source, external_id: lead.external_id, subject: lead.subject },
      tags: { intent, urgency, urgency_score, urgency_reasons, sentiment },
      draft: draft ? { id: draft.id, body: draft.content?.body } : null
    });
  } catch (e: any) {
    console.error('[test_email_all] FATAL:', e);
    return json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
};
