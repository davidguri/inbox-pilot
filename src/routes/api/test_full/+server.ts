// src/routes/api/test_full/+server.ts
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

import { supabase } from '../../../supabase/supabase'; // uses your existing client
import { classifyIntent } from '../../../lib/api/classify.api';      // ⬅ adjust path if needed
import { classifyUrgencyFull } from '../../../lib/api/sentiment.api'; // ⬅ adjust path if needed

type Contact = { name?: string | null; email?: string | null; phone?: string | null; company?: string | null };
type Body = {
  text: string;
  source?: string;
  subject?: string | null;
  external_id?: string | null;   // optional idempotency
  contact?: Contact;
};

function normEmail(e?: string | null) { return e ? e.trim().toLowerCase() : null; }
function normPhone(p?: string | null) {
  if (!p) return null;
  const d = p.replace(/[^\d+]/g, '');
  if (!d) return null;
  if (d.startsWith('+')) return d;
  if (d.startsWith('00')) return '+' + d.slice(2);
  return '+' + d;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = (await request.json()) as Body;
    const text = String(body.text ?? '');
    if (!text.trim()) return json({ ok: false, error: 'Provide { text, source?, subject?, external_id?, contact? }' }, { status: 400 });

    const source = body.source || 'email';
    const subject = body.subject ?? null;
    const external_id = body.external_id ?? null;
    const contact = body.contact ?? {};

    // 1) Create lead
    const { data: inserted, error: insErr } = await supabase
      .from('leads')
      .insert({ source, raw_text: text, subject, external_id })
      .select('id')
      .single();
    if (insErr || !inserted) throw new Error(insErr?.message || 'Insert failed');
    const leadId = inserted.id as string;

    // 2) AI (parallel)
    const [intent, urg] = await Promise.all([classifyIntent(text), classifyUrgencyFull(text)]);

    // 3) Update lead with AI
    const { error: updErr } = await supabase
      .from('leads')
      .update({
        intent,
        urgency: urg.urgency,
        urgency_score: urg.score,
        urgency_reasons: urg.reasons,
        sentiment: urg.sentiment
      })
      .eq('id', leadId);
    if (updErr) throw new Error(updErr.message);

    // 4) Upsert client (by email/phone) & link
    let clientId: string | null = null;
    const email = normEmail(contact.email);
    const phone = normPhone(contact.phone);

    if (email || phone || contact.name || contact.company) {
      // try email
      if (email) {
        const { data } = await supabase.from('clients').select('id').eq('email', email).maybeSingle();
        if (data?.id) clientId = data.id;
      }
      // try phone
      if (!clientId && phone) {
        const { data } = await supabase.from('clients').select('id').eq('phone', phone).maybeSingle();
        if (data?.id) clientId = data.id;
      }
      // insert if new
      if (!clientId) {
        const { data: cIns, error: cErr } = await supabase
          .from('clients')
          .insert({ name: contact.name ?? null, email, phone, company: contact.company ?? null })
          .select('id')
          .single();
        if (cErr) throw new Error(cErr.message);
        clientId = cIns!.id as string;
      }
      // link
      const { error: linkErr } = await supabase.from('leads').update({ client_id: clientId }).eq('id', leadId);
      if (linkErr) throw new Error(linkErr.message);
    }

    // 5) Read back final row
    const { data: row, error: selErr } = await supabase
      .from('leads')
      .select('id, source, subject, raw_text, intent, urgency, urgency_score, urgency_reasons, sentiment, client_id, created_at')
      .eq('id', leadId)
      .single();
    if (selErr) throw new Error(selErr.message);

    return json({
      ok: true,
      leadId,
      clientId,
      intent,
      urgency: urg.urgency,
      urgency_score: urg.score,
      urgency_reasons: urg.reasons,
      sentiment: urg.sentiment,
      row
    });
  } catch (e: any) {
    console.error('[test_full] ERROR:', e);
    return json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
};
