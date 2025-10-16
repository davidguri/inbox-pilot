import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

// your existing anon Supabase client
import { supabase } from '../../../supabase/supabase';

// OPTIONAL: if you have these, leave imports; otherwise comment out the classify block below
import { classifyIntent } from '../inbound/classify.api';
import { classifyUrgencyFull } from '../inbound/sentiment.api';

type Body = {
  org_id: string;

  client?: {
    name?: string | null;
    email?: string | null;
    company?: string | null;
    phone?: string | null;
  };

  lead?: {
    source?: 'email' | 'whatsapp' | 'web' | 'manual';
    external_id?: string | null;  // message/thread id from n8n, optional
    subject?: string | null;
    text: string;                 // message body
  };

  classify?: boolean; // default true
};

// ---- helper: upsert client by (org_id, lower(email)) ----
async function upsertClient(org_id: string, c: Required<NonNullable<Body['client']>>) {
  const email = c.email?.toLowerCase().trim() || null;

  if (email) {
    const { data: existing, error: selErr } = await supabase
      .from('clients')
      .select('*')
      .eq('org_id', org_id)
      .eq('email', email)
      .maybeSingle();
    if (selErr) throw new Error(selErr.message);
    if (existing) return existing;
  }

  const payload = {
    org_id,
    name: c.name ?? 'New Client',
    email,
    company: c.company ?? null,
    phone: c.phone ?? null
  };

  const { data, error } = await supabase
    .from('clients')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const b = (await request.json()) as Body;

    // ---- Validate input ----
    const org_id = String(b.org_id || '').trim();
    if (!org_id) return json({ ok: false, error: 'org_id is required' }, { status: 400 });

    const clientIn = b.client ?? {};
    const leadIn = b.lead ?? { text: '' as string };
    if (!leadIn.text || !leadIn.text.trim()) {
      return json({ ok: false, error: 'lead.text is required' }, { status: 400 });
    }

    const classify = b.classify !== false; // default true

    // ---- Confirm org exists (optional but nice) ----
    {
      const { data, error } = await supabase.from('organizations').select('id').eq('id', org_id).maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return json({ ok: false, error: 'organization not found' }, { status: 404 });
    }

    // ---- Upsert/create client ----
    const client = await upsertClient(org_id, {
      name: clientIn.name ?? 'New Client',
      email: clientIn.email ?? null,
      company: clientIn.company ?? null,
      phone: clientIn.phone ?? null
    });

    // ---- Manual find-or-insert for lead (no ON CONFLICT) ----
    const baseLead = {
      org_id,
      client_id: client.id,
      source: (leadIn.source ?? 'email') as NonNullable<Body['lead']>['source'],
      external_id: leadIn.external_id ?? null,
      subject: leadIn.subject ?? null,
      raw_text: leadIn.text
    };

    let leadRow: any = null;

    if (baseLead.external_id) {
      // Find existing by (org_id, source, external_id)
      const { data: existing, error: findErr } = await supabase
        .from('leads')
        .select('*')
        .eq('org_id', org_id)
        .eq('source', baseLead.source as string)
        .eq('external_id', baseLead.external_id)
        .maybeSingle();
      if (findErr) throw new Error(findErr.message);

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('leads')
          .update(baseLead)
          .eq('id', existing.id)
          .select('*')
          .single();
        if (error) throw new Error(error.message);
        leadRow = data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('leads')
          .insert(baseLead)
          .select('*')
          .single();
        if (error) throw new Error(error.message);
        leadRow = data;
      }
    } else {
      // No external_id → simple insert
      const { data, error } = await supabase
        .from('leads')
        .insert(baseLead)
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      leadRow = data;
    }

    // ---- Optional: classify intent + urgency on create ----
    let tagged: any = null;
    if (classify) {
      try {
        const intent = await classifyIntent(leadIn.text);
        const { urgency, score, reasons, sentiment } = await classifyUrgencyFull(leadIn.text);

        const { data, error } = await supabase
          .from('leads')
          .update({
            intent,
            urgency,
            urgency_score: score,
            urgency_reasons: reasons,
            sentiment
          })
          .eq('id', leadRow.id)
          .select('id,intent,urgency,urgency_score,urgency_reasons,sentiment')
          .single();
        if (!error) tagged = data;
      } catch (e) {
        console.warn('[classify-on-create] failed:', e);
      }
    }

    return json({
      ok: true,
      client: { id: client.id, name: client.name, email: client.email, company: client.company },
      lead: { id: leadRow.id, source: leadRow.source, external_id: leadRow.external_id, subject: leadRow.subject },
      tagged // may be null if classify=false or classification failed
    });
  } catch (e: any) {
    console.error('[test_create_lead] ERROR:', e);
    return json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
};
