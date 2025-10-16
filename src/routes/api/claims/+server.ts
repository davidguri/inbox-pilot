import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '../../../supabase/supabase';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const orgId = url.searchParams.get('org_id');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const status = url.searchParams.get('status');

    if (!orgId) {
      return json({ error: 'org_id parameter is required' }, { status: 400 });
    }

    let query = supabase
      .from('claims')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: claims, error } = await query;

    if (error) {
      // If table doesn't exist, return empty array
      if (error.code === 'PGRST116' || error.message.includes('relation "claims" does not exist')) {
        return json({ claims: [] });
      }
      console.error('Error fetching claims:', error);
      return json({ error: 'Failed to fetch claims' }, { status: 500 });
    }

    return json({ claims: claims || [] });
  } catch (error) {
    console.error('Error in claims API:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
