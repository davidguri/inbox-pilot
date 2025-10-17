// src/routes/api/inbound/email/+server.ts
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase/supabase';
import { classifyIntent } from '../../../../lib/api/classify.api';
import { classifyUrgencyFull } from '../../../../lib/api/sentiment.api';
import { normEmail } from '$lib/utils/normalize.util';

type InboundContact = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
};

enum Source {
  EMAIL = 'email',
  WEB = 'web',
  WHATSAPP = 'whatsapp'
}

type InboundBody = {
  source?: Source;
  external_id?: string | null;
  subject?: string | null;
  text: string;
  contact?: InboundContact;
  meta?: unknown;
  organization_id?: string | null;
};

async function findExistingLead(source: string, external_id: string) {
  const { data } = await supabase
    .from('leads')
    .select('id')
    .eq('source', source)
    .eq('external_id', external_id)
    .maybeSingle();
  return data?.id as string | undefined;
}

async function createLead(input: { source: string; text: string; subject?: string | null; external_id?: string | null; org_id?: string | null }) {
  const { data, error } = await supabase
    .from('leads')
    .insert({
      source: input.source,
      raw_text: input.text,
      subject: input.subject ?? null,
      external_id: input.external_id ?? null,
      org_id: input.org_id ?? null
    })
    .select('id, created_at')
    .single();
  if (error) throw new Error(error.message);
  return data!.id as string;
}

async function updateLeadAI(leadId: string, ai: { intent: string; urgency: string; score: number; reasons: string[]; sentiment: string }) {
  const { error } = await supabase
    .from('leads')
    .update({
      intent: ai.intent,
      urgency: ai.urgency,
      urgency_score: ai.score,
      urgency_reasons: ai.reasons,
      sentiment: ai.sentiment
    })
    .eq('id', leadId);
  if (error) throw new Error(error.message);
}

async function upsertClient(c: InboundContact, org_id?: string | null) {
  const email = normEmail(c.email);
  if (email) {
    const { data } = await supabase.from('clients').select('*').eq('email', email).maybeSingle();
    if (data) return data.id as string;
  }

  const { data, error } = await supabase
    .from('clients')
    .insert({
      name: c.name ?? null,
      email,
      phone: c.phone ?? null,
      company: c.company ?? null,
      org_id: org_id ?? null
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return data!.id as string;
}

async function linkLeadToClient(leadId: string, clientId: string) {
  const { error } = await supabase.from('leads').update({ client_id: clientId }).eq('id', leadId);
  if (error) throw new Error(error.message);
}

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const body = (await request.json()) as InboundBody;
    const text = String(body.text ?? '');
    if (!text.trim()) {
      return json({ ok: false, error: 'Provide { text, source?, subject?, external_id?, contact? }' }, { status: 400 });
    }

    const source = body.source || Source.EMAIL;
    const subject = body.subject ?? null;
    const external_id = body.external_id ?? null;
    const contact: InboundContact = body.contact ?? {};

    // Get org_id from body, locals, or get default org
    let org_id = body.organization_id || locals.orgId || null;

    // If no org_id, try to get the first organization as default
    if (!org_id) {
      const { data: defaultOrg } = await supabase
        .from('organizations')
        .select('id')
        .limit(1)
        .maybeSingle();
      org_id = defaultOrg?.id || null;
    }

    let leadId: string | undefined;
    if (external_id) {
      leadId = await findExistingLead(source, external_id);
    }

    if (!leadId) {
      leadId = await createLead({ source, text, subject, external_id, org_id });
    }

    const [intent, urg] = await Promise.all([classifyIntent(text), classifyUrgencyFull(text)]);

    await updateLeadAI(leadId, {
      intent,
      urgency: urg.urgency,
      score: urg.score,
      reasons: urg.reasons,
      sentiment: urg.sentiment
    });

    let clientId: string | null = null;
    if (contact.email || contact.phone || contact.name || contact.company) {
      try {
        clientId = await upsertClient(contact, org_id);
        await linkLeadToClient(leadId, clientId);
      } catch (e) {
        console.warn('Client upsert/link failed:', e);
      }
    }

    const { data: row } = await supabase
      .from('leads')
      .select('id, source, subject, raw_text, intent, urgency, urgency_score, urgency_reasons, sentiment, client_id, created_at')
      .eq('id', leadId)
      .single();

    return json({
      ok: true,
      leadId,
      clientId,
      intent,
      urgency: urg.urgency,
      urgency_score: urg.score,
      urgency_reasons: urg.reasons,
      sentiment: urg.sentiment,
      subject,
      text: text.slice(0, 500),
      row
    });
  } catch (e: any) {
    console.error('[inbound/email] ERROR:', e);
    return json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
};
