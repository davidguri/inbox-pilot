import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/supabase/supabase';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const orgId = url.searchParams.get('org_id');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    if (!orgId) {
      return json({ error: 'org_id parameter is required' }, { status: 400 });
    }

    const { data: clients, error } = await supabase
      .from('clients')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching clients:', error);
      return json({ error: 'Failed to fetch clients' }, { status: 500 });
    }

    return json({ clients: clients || [] });
  } catch (error) {
    console.error('Error in clients API:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
