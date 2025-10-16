import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

import { supabase } from '../../../supabase/supabase';
import { classifyIntent } from '../../../lib/api/classify.api';
import { classifyUrgencyFull } from '../../../lib/api/sentiment.api';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({} as any));
    const text = String(body.text ?? '').trim();
    const leadId = body.leadId ? String(body.leadId) : '';
    const org_id = body.org_id ? String(body.org_id) : ''; // REQUIRED when leadId is absent

    if (!text) {
      return json({ ok: false, error: 'Provide { "text": "...", leadId?: "uuid", org_id?: "uuid" }' }, { status: 400 });
    }

    // If no leadId, we create a temp lead (requires org_id)
    let effectiveLeadId = leadId;
    if (!effectiveLeadId) {
      if (!org_id) {
        return json({ ok: false, error: 'org_id is required when leadId is not provided' }, { status: 400 });
      }

      // (Optional) sanity check org exists
      const { data: org, error: orgErr } = await supabase
        .from('organizations')
        .select('id')
        .eq('id', org_id)
        .maybeSingle();
      if (orgErr) throw new Error(`organizations.select: ${orgErr.message}`);
      if (!org) return json({ ok: false, error: 'organization not found' }, { status: 404 });

      // Create a minimal lead carrying org_id so NOT NULL passes
      const { data: ins, error: insErr } = await supabase
        .from('leads')
        .insert({
          org_id,
          client_id: null,
          source: 'manual',
          external_id: null,
          subject: 'Test (intent/urgency)',
          raw_text: text
        })
        .select('id')
        .single();
      if (insErr) throw new Error(`leads.insert: ${insErr.message}`);
      effectiveLeadId = ins!.id;
    }

    // Run classifications
    const intent = await classifyIntent(text) as 'sales' | 'support' | 'spam';
    const u = await classifyUrgencyFull(text); // { urgency, score, reasons, sentiment }

    // Persist tags to the lead
    const { error: updErr } = await supabase
      .from('leads')
      .update({
        intent,
        urgency: u.urgency,
        urgency_score: u.score,
        urgency_reasons: u.reasons,
        sentiment: u.sentiment
      })
      .eq('id', effectiveLeadId);
    if (updErr) throw new Error(`leads.update(tags): ${updErr.message}`);

    // Return both the intent and the updated lead id
    return json({
      ok: true,
      lead_id: effectiveLeadId,
      intent,
      urgency: u.urgency,
      urgency_score: u.score,
      urgency_reasons: u.reasons,
      sentiment: u.sentiment
    });
  } catch (e: any) {
    console.error('[test-intent-urgency] ERROR:', e);
    return json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
};
