// src/routes/api/test-intent/+server.ts
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

import { classifyIntent, leadAttachIntent } from '../inbound/classify.api';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const text = String(body.text ?? '');
    const leadId = body.leadId as string | undefined;

    if (!text) {
      return json({ ok: false, error: 'Provide { "text": "...", leadId?: "uuid" }' }, { status: 400 });
    }

    const intent = await classifyIntent(text);

    let updated: unknown = null;
    if (leadId) {
      try {
        updated = await leadAttachIntent(leadId, intent as any);
      } catch (e: any) {
        return json({ ok: false, intent, db_error: String(e?.message || e) }, { status: 500 });
      }
    }

    return json({ ok: true, intent, updated });
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
};
