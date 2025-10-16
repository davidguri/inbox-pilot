import { supabase } from '../../supabase/supabase';

export type ClaimStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export type ClaimInput = {
  title?: string | null;
  description?: string | null;
  status?: ClaimStatus | null;
  client_id?: string | null;
  lead_id?: string | null;
  priority?: 'low' | 'medium' | 'high' | null;
};

export type ClaimRow = {
  id: string;
  org_id: string;
  title: string | null;
  description: string | null;
  status: ClaimStatus | null;
  client_id: string | null;
  lead_id: string | null;
  priority: 'low' | 'medium' | 'high' | null;
  created_at: string;
  updated_at: string;
};

export async function createClaim(input: ClaimInput & { org_id: string }): Promise<ClaimRow> {
  const { data, error } = await supabase
    .from('claims')
    .insert({
      org_id: input.org_id,
      title: input.title?.trim() || null,
      description: input.description?.trim() || null,
      status: input.status || 'open',
      client_id: input.client_id || null,
      lead_id: input.lead_id || null,
      priority: input.priority || 'medium'
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as ClaimRow;
}

export async function updateClaim(id: string, input: Partial<ClaimInput>): Promise<ClaimRow> {
  const { data, error } = await supabase
    .from('claims')
    .update({
      title: input.title?.trim(),
      description: input.description?.trim(),
      status: input.status,
      client_id: input.client_id,
      lead_id: input.lead_id,
      priority: input.priority
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as ClaimRow;
}

export async function getClaims(orgId: string, filters?: {
  status?: ClaimStatus;
  client_id?: string;
  lead_id?: string;
  limit?: number;
  offset?: number;
}): Promise<{ claims: ClaimRow[]; total: number }> {
  let query = supabase
    .from('claims')
    .select('*', { count: 'exact' })
    .eq('org_id', orgId);

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.client_id) {
    query = query.eq('client_id', filters.client_id);
  }

  if (filters?.lead_id) {
    query = query.eq('lead_id', filters.lead_id);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  return {
    claims: data as ClaimRow[],
    total: count || 0
  };
}

export async function getClaim(id: string): Promise<ClaimRow | null> {
  const { data, error } = await supabase
    .from('claims')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as ClaimRow | null;
}

export async function deleteClaim(id: string): Promise<void> {
  const { error } = await supabase
    .from('claims')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function getClaimsByClient(clientId: string): Promise<ClaimRow[]> {
  const { data, error } = await supabase
    .from('claims')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as ClaimRow[];
}

export async function getClaimsByLead(leadId: string): Promise<ClaimRow[]> {
  const { data, error } = await supabase
    .from('claims')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as ClaimRow[];
}
