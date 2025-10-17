import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  console.log('=== LAYOUT SERVER LOAD ===');
  console.log('locals.user:', locals.user);
  console.log('locals.session:', locals.session);
  console.log('locals.orgId:', locals.orgId);

  const result = {
    user: locals.user,
    session: locals.session,
    orgId: '285e8ad6-d67d-4530-941d-efbf637a0cf9' // Hardcoded org_id
  };

  console.log('Returning:', result);
  console.log('==========================');

  return result;
};
