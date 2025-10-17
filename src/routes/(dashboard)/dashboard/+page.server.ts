import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
  console.log('=== DASHBOARD PAGE SERVER LOAD ===');
  const parentData = await parent();
  console.log('Parent data:', parentData);
  console.log('Parent orgId:', parentData.orgId);
  console.log('==================================');

  // Explicitly pass through the orgId from parent layout
  return {
    orgId: parentData.orgId || '285e8ad6-d67d-4530-941d-efbf637a0cf9'
  };
};

