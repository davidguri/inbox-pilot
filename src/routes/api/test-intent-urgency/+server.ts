// src/routes/api/test-intent-urgency/+server.ts
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from '$env/static/private';

// ⬇️ Use your existing classifiers (adjust import paths if needed)
import { classifyIntent } from '../inbound/classify.api';
import { classifyUrgencyFull } from '../inbound/sentiment.api';

// Server-only Supabase client (service role bypasses RLS for this test route)
const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const text = String(body.text ?? '');
    const source = String(body.source ?? 'web');

    if (!text.trim()) {
      return json({ ok: false, error: 'Provide { "text": "...", source?: "web|email|whatsapp" }' }, { status: 400 });
    }

    // 1) Create a new lead
    const { data: inserted, error: insErr } = await sb
      .from('leads')
      .insert({ source, raw_text: text })
      .select('id, created_at')
      .single();

    if (insErr || !inserted) throw new Error(`Insert failed: ${insErr?.message ?? 'no row returned'}`);

    const leadId = inserted.id as string;

    // 2) Run AI in parallel
    const [intent, urg] = await Promise.all([
      classifyIntent(text),
      classifyUrgencyFull(text) // { urgency, score, reasons, sentiment }
    ]);

    // 3) Update the lead with AI results
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

    if (updErr) throw new Error(`Update failed: ${updErr.message}`);

    // 4) Read back the final row
    const { data: finalRow, error: selErr } = await sb
      .from('leads')
      .select('id, source, raw_text, intent, urgency, urgency_score, urgency_reasons, sentiment, created_at')
      .eq('id', leadId)
      .single();

    if (selErr) throw new Error(`Select failed: ${selErr.message}`);

    return json({
      ok: true,
      leadId,
      input_preview: text.slice(0, 160),
      intent,
      urgency: urg.urgency,
      urgency_score: urg.score,
      urgency_reasons: urg.reasons,
      sentiment: urg.sentiment,
      row: finalRow
    });
  } catch (e: any) {
    console.error('[test-intent-urgency] ERROR:', e);
    return json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
};
