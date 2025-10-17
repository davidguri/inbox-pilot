import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/supabase/supabase';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const orgId = url.searchParams.get('org_id');

    if (!orgId) {
      return json({ error: 'org_id parameter is required' }, { status: 400 });
    }

    // Get counts for different entities
    const [clientsResult, leadsResult, claimsResult] = await Promise.all([
      supabase
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId),

      supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId),

      // Handle case where claims table might not exist yet
      supabase
        .from('claims')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('status', 'open')
        .match({ count: 0, error: null })
    ]);

    // Get leads by status for more detailed stats
    const leadsByStatus = await supabase
      .from('leads')
      .select('status')
      .eq('org_id', orgId);

    const leadsStats = leadsByStatus.data?.reduce((acc, lead) => {
      acc[lead.status || 'unknown'] = (acc[lead.status || 'unknown'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentLeads, recentClaims] = await Promise.all([
      supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .gte('created_at', thirtyDaysAgo.toISOString()),

      // Handle case where claims table might not exist yet
      supabase
        .from('claims')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('status', 'open')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .match({ count: 0, error: null })
    ]);

    const stats = {
      clients: clientsResult.count || 0,
      totalLeads: leadsResult.count || 0,
      openClaims: (claimsResult as any).count || 0,
      leadsByStatus: leadsStats,
      recentLeads: recentLeads.count || 0,
      recentOpenClaims: (recentClaims as any).count || 0
    };

    return json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return json({ error: 'Failed to fetch dashboard statistics' }, { status: 500 });
  }
};
