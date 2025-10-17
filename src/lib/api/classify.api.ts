import { supabase } from '$lib/supabase/supabase';
import { hf } from './hf.api';

export enum Labels {
  SALES = 'sales',
  SUPPORT = 'support',
  SPAM = 'spam'
}

type ZSResp = { labels: string[]; scores: number[] }[];

const SUPPORT_HINTS_EN = [
  'bug', 'issue', 'error', '500', 'crash', 'fails', 'down', 'not working', 'problem',
  'refund', 'warranty', 'help', 'support', 'fix', 'debug', 'cannot', 'can’t', 'can\'t'
];

const SUPPORT_HINTS_SQ = [
  'gabim', 'problem', 'defekt', 'ndahet', 'nuk punon', 'jo funksionon', 'ndihmë', 'ndihme',
  'mbështetje', 'support', 'rimbursim', 'faturë nuk', 'nuk mund', 's’punon', 'spunon'
];

const SPAM_HINTS = [
  'click here', 'make $', 'win $', 'crypto', 'bitcoin', 'pump', 'investment opportunity',
  'adult', 'xxx', 'viagra', 'loan approval', 'betting', 'casino', 'airdrop', 'bonus'
];

const SPAM_RE = /\b(?:\$?\d{3,}\s*(?:per\s*(?:day|week)|\/\s*(?:day|week))|https?:\/\/\S+|wa\.me\/\d+|\+\d{7,}|telegram|t\.me\/\S+)\b/i;

function hasAny(hay: string, needles: string[]) {
  return needles.some(n => hay.includes(n));
}

async function zeroShotIntent(text: string) {
  const data = await hf('MoritzLaurer/mDeBERTa-v3-base-mnli-xnli', {
    inputs: text.slice(0, 2000),
    parameters: {
      candidate_labels: [
        'a sales inquiry about buying a product or service',
        'a customer support/bug report request',
        'unsolicited spam or promotion'
      ],
      hypothesis_template: 'This message is {}.',
      multi_label: true
    },
    options: { wait_for_model: true }
  }) as ZSResp;

  const first = Array.isArray(data) ? data[0] : undefined;
  const map = new Map<string, number>();
  if (first?.labels && first?.scores) {
    for (let i = 0; i < first.labels.length; i++) {
      map.set(first.labels[i], first.scores[i]);
    }
  }
  const sSales = map.get('a sales inquiry about buying a product or service') ?? 0;
  const sSupport = map.get('a customer support/bug report request') ?? 0;
  const sSpam = map.get('unsolicited spam or promotion') ?? 0;

  return { sSales, sSupport, sSpam };
}

/**
 * Final decision with lightweight rules to counter model bias.
 */
export async function classifyIntent(text: string): Promise<Labels> {
  const t = text.toLowerCase();

  // 0) Hard rules first (spam)
  if (SPAM_RE.test(t) || hasAny(t, SPAM_HINTS)) return Labels.SPAM;

  // 1) Model scores
  let sSales = 0, sSupport = 0, sSpam = 0;
  try {
    const zs = await zeroShotIntent(text);
    sSales = zs.sSales; sSupport = zs.sSupport; sSpam = zs.sSpam;
  } catch (e) {
    console.warn('zeroShotIntent failed, falling back to rules:', e);
  }

  // 2) Heuristic boosts
  const supportHit = hasAny(t, SUPPORT_HINTS_EN) || hasAny(t, SUPPORT_HINTS_SQ);
  if (supportHit) sSupport += 0.15; // small nudge

  // 3) Decision thresholds
  // - Support if clearly above sales/spam OR rule hit and not obviously spam
  if (sSupport >= Math.max(sSales, sSpam) + 0.10 || (supportHit && sSpam < 0.50)) {
    return Labels.SUPPORT;
  }

  // - Spam if high enough confidence or spam rule flags
  if (sSpam >= 0.50) return Labels.SPAM;

  // - Otherwise sales (default)
  return Labels.SALES;
}

export async function leadAttachIntent(leadId: string, intent: Labels) {
  const { data, error } = await supabase
    .from('leads')
    .update({ intent })
    .eq('id', leadId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}