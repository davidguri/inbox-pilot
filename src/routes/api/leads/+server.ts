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

    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching leads:', error);
      return json({ error: 'Failed to fetch leads' }, { status: 500 });
    }

    return json({ leads: leads || [] });
  } catch (error) {
    console.error('Error in leads API:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
