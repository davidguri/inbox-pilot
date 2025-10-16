import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from '$env/static/private';

// your existing classifiers (adjust paths)
import { classifyIntent } from '../../../lib/api/classify.api';
import { classifyUrgencyFull } from '../../../lib/api/sentiment.api';
import { resolveAndLinkLead } from '../../../lib/db/clients.db';

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const text = String(body.text ?? '');
    const source = String(body.source ?? 'web');

    // client payload (all optional)
    const name = body.name ? String(body.name) : null;
    const email = body.email ? String(body.email) : null;
    const phone = body.phone ? String(body.phone) : null;
    const company = body.company ? String(body.company) : null;

    if (!text.trim()) {
      return json({ ok: false, error: 'Provide { text, source?, name?, email?, phone?, company? }' }, { status: 400 });
    }

    // 1) Create lead with raw text
    const { data: lead, error: insErr } = await sb
      .from('leads')
      .insert({ source, raw_text: text })
      .select('id, created_at')
      .single();
    if (insErr || !lead) throw new Error(`Insert failed: ${insErr?.message ?? 'no row'}`);

    const leadId = lead.id as string;

    // 2) AI in parallel
    const [intent, urg] = await Promise.all([classifyIntent(text), classifyUrgencyFull(text)]);

    // 3) Update lead with AI
    const { error: updErr } = await sb
      .from('leads')
      .update({
        intent,
        urgency: urg.urgency,
        urgency_score: urg.score,
        urgency_reasons: urg.reasons,
        sentiment: urg.sentiment
      })
      .eq('id', leadId);
    if (updErr) throw new Error(`Update lead failed: ${updErr.message}`);

    // 4) Upsert client & link
    const { client, lead: joinedLead } = await resolveAndLinkLead(leadId, { name, email, phone, company });

    return json({
      ok: true,
      leadId,
      clientId: client.id,
      intent,
      urgency: urg.urgency,
      urgency_score: urg.score,
      sentiment: urg.sentiment,
      lead: joinedLead,
      client
    });
  } catch (e: any) {
    console.error('[test-create-lead-and-client] ERROR:', e);
    return json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
};
