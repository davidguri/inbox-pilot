import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
  const parentData = await parent();
  return {
    orgId: parentData.orgId || '285e8ad6-d67d-4530-941d-efbf637a0cf9'
  };
};

