import { supabase } from '../../supabase/supabase';
import { hf } from '../api/hf.api';
import { Labels } from '../api/classify.api';
import { Urgency, Sentiment } from '../api/sentiment.api';

type LeadCtx = {
  id: string;
  org_id: string;
  client_id: string | null;
  subject: string | null;
  raw_text: string;
  intent: Labels | null;
  urgency: Urgency | null;
  sentiment: Sentiment | null;
  org_name: string;
  client_name: string | null;
};

async function fetchLeadContext(leadId: string): Promise<LeadCtx> {
  const { data: lead, error: leadErr } = await supabase
    .from('leads')
    .select('id, org_id, client_id, subject, raw_text, intent, urgency, sentiment')
    .eq('id', leadId)
    .single();
  if (leadErr) throw new Error(leadErr.message);
  if (!lead) throw new Error('Lead not found');

  const { data: org, error: orgErr } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('id', lead.org_id)
    .single();
  if (orgErr) throw new Error(orgErr.message);
  if (!org) throw new Error('Organization not found for lead');

  let client_name: string | null = null;
  if (lead.client_id) {
    const { data: client, error: clientErr } = await supabase
      .from('clients')
      .select('name')
      .eq('id', lead.client_id)
      .maybeSingle();
    if (clientErr) throw new Error(clientErr.message);
    client_name = client?.name ?? null;
  }

  return {
    id: lead.id,
    org_id: lead.org_id,
    client_id: lead.client_id,
    subject: lead.subject,
    raw_text: lead.raw_text ?? '',
    intent: (lead.intent as Labels) ?? null,
    urgency: (lead.urgency as Urgency) ?? null,
    sentiment: (lead.sentiment as Sentiment) ?? null,
    org_name: org.name,
    client_name
  };
}

function buildReplyPrompt(ctx: LeadCtx) {
  const system = `
You draft short, professional email replies in the SAME language as the original message (auto-detect).
Rules:
- Max ~120 words, plain text (no markdown).
- If intent is "spam", output exactly: [NO_REPLY_SPAM]
- If intent is "support": ask for ONE clarifying detail max and propose the next step.
- If intent is "sales": summarize the ask, propose 1–2 concrete next steps, ask for quick confirmation.
- Be polite, clear, and actionable.
- End with a signoff using the organization name.
`.trim();

  const meta = [
    ctx.intent ? `Intent: ${ctx.intent}` : null,
    ctx.urgency ? `Urgency: ${ctx.urgency}` : null,
    ctx.sentiment ? `Sentiment: ${ctx.sentiment}` : null
  ]
    .filter(Boolean)
    .join(' • ');

  const prompt = `
${meta || 'Intent: n/a'}
Organization: ${ctx.org_name}
${ctx.client_name ? `Client: ${ctx.client_name}` : ''}

Original message:
"""
${String(ctx.raw_text ?? '').slice(0, 2000)}
"""

Draft the full reply (with greeting and signoff). Plain text only.
`.trim();

  return { system, prompt };
}

// Call a *generation* model (NOT a classifier). Single model, no candidates.
async function callModel(system: string, prompt: string): Promise<string> {
  const inputs = `${system}\n\nUser:\n${prompt}\nAssistant:`;

  const res = await hf('TinyLlama/TinyLlama-1.1B-Chat-v1.0', {
    inputs,
    parameters: { max_new_tokens: 220, temperature: 0.3, top_p: 0.9, repetition_penalty: 1.05 },
    options: { wait_for_model: true }
  }) as any;

  // HF returns a few shapes depending on pipeline:
  // - [{ generated_text: "..." }]
  // - { generated_text: "..." }
  // - "..." (rare)
  const raw =
    (Array.isArray(res) && res[0]?.generated_text) ||
    res?.generated_text ||
    (typeof res === 'string' ? res : '');

  const body = (raw || '').toString().replace(/^assistant:\s*/i, '').trim();
  if (!body) throw new Error(`Empty generation from model 'TinyLlama/TinyLlama-1.1B-Chat-v1.0'`);

  return /\[NO_REPLY_SPAM\]/i.test(body) ? '[NO_REPLY_SPAM]' : body;
}

export async function generateReplyBodyForLead(leadId: string): Promise<string> {
  const ctx = await fetchLeadContext(leadId);

  // Hard stop for spam to avoid unnecessary HF calls
  if (ctx.intent === 'spam') return '[NO_REPLY_SPAM]';

  const { system, prompt } = buildReplyPrompt(ctx);
  return await callModel(system, prompt);
}

export async function createReplyDraftForLead(leadId: string) {
  const ctx = await fetchLeadContext(leadId);

  // Hard stop for spam
  const body =
    ctx.intent === 'spam'
      ? '[NO_REPLY_SPAM]'
      : await (async () => {
        const { system, prompt } = buildReplyPrompt(ctx);
        return await callModel(system, prompt);
      })();

  const { data, error } = await supabase
    .from('drafts')
    .insert({
      org_id: ctx.org_id,
      lead_id: ctx.id,
      type: 'reply',
      content: { body }
    })
    .select('id, org_id, lead_id, type, content, created_at')
    .single();

  if (error) throw new Error(error.message);
  return data;
}