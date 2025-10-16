import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from '$env/static/private';

export type ClientInput = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
};

export type ClientRow = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
};

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

function toE164(raw?: string | null) {
  if (!raw) return null;
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return null;
  return digits.startsWith('00') ? '+' + digits.slice(2) : digits.startsWith('+') ? '+' + digits.replace(/[^\d]/g, '') : '+' + digits;
}

export async function upsertClient(input: ClientInput): Promise<ClientRow> {
  const email = input.email?.trim().toLowerCase() || null;
  const phone = toE164(input.phone);
  const name = input.name?.trim() || null;
  const company = input.company?.trim() || null;

  if (email) {
    const { data } = await sb.from('clients').select('*').eq('email', email).maybeSingle();
    if (data) return data as ClientRow;
  }

  if (phone) {
    const { data } = await sb.from('clients').select('*').eq('phone', phone).maybeSingle();
    if (data) return data as ClientRow;
  }

  const { data: inserted, error } = await sb
    .from('clients')
    .insert({ name, email, phone, company })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return inserted as ClientRow;
}

export async function linkLeadToClient(leadId: string, clientId: string) {
  const { error } = await sb.from('leads').update({ client_id: clientId }).eq('id', leadId);
  if (error) throw new Error(error.message);
}

export async function resolveAndLinkLead(leadId: string, input: ClientInput) {
  const client = await upsertClient(input);
  await linkLeadToClient(leadId, client.id);
  const { data: lead } = await sb
    .from('leads')
    .select('id, source, raw_text, intent, urgency, client_id, created_at')
    .eq('id', leadId)
    .single();
  return { client, lead };
}