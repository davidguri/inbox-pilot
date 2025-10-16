// src/routes/api/test_user_org/+server.ts
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

import { createAuthUserDev, ensureProfile, setDefaultOrg } from '../../../lib/db/users.db';
import { upsertOrganization } from '../../../lib/db/org.db';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const name = String(body.name ?? '').trim();   // org name
    const slug = body.slug ? String(body.slug) : null;

    let userId = body.userId ? String(body.userId).trim() : '';
    const email = body.email ? String(body.email).trim() : '';
    const password = body.password ? String(body.password) : '';
    const fullName = body.full_name ? String(body.full_name) : undefined;

    if (!name) return json({ ok: false, error: 'Provide { name, ... }' }, { status: 400 });

    // 1) USER: either use existing userId OR create one for dev
    if (!userId) {
      if (!email || !password) {
        return json({ ok: false, error: 'Provide userId OR email+password' }, { status: 400 });
      }
      const user = await createAuthUserDev(email, password); // dev-only shortcut
      userId = user.id;
    }

    // 2) PROFILE: ensure profile row exists (and store email/full_name if provided)
    const profile = await ensureProfile(userId, email || undefined, fullName);

    // 3) ORG: create or reuse
    const org = await upsertOrganization({ name, owner_user_id: userId, slug });

    // 4) PROFILE: set default org
    const updatedProfile = await setDefaultOrg(userId, org.id);

    return json({
      ok: true,
      user: { id: userId, email: email || profile.email },
      profile: { id: updatedProfile.id, default_org_id: updatedProfile.default_org_id },
      org: { id: org.id, name: org.name, slug: org.slug, owner_user_id: org.owner_user_id }
    });
  } catch (e: any) {
    console.error('[test_user_org] ERROR:', e);
    return json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
};
