import { supabase } from '../../../supabase/supabase';
import { hf } from "./hf.api";

enum Urgency {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

enum Sentiment {
  NEGATIVE = 'negative',
  NEUTRAL = 'neutral',
  POSITIVE = 'positive'
}

export async function sentimentMultilingual(text: string) {
  try {
    const res = await hf('cardiffnlp/twitter-xlm-roberta-base-sentiment', {
      inputs: text.slice(0, 512),
      options: { wait_for_model: true }
    }) as Array<Array<{ label: string; score: number }>>;

    if (!Array.isArray(res) || !res[0] || !Array.isArray(res[0])) {
      console.warn('Unexpected HF sentiment API response:', res);
      return { label: 'neutral', score: 0.33 };
    }

    const best = res[0].sort((a, b) => b.score - a.score)[0] ?? { label: 'neutral', score: 0.33 };
    const lbl = best.label.toLowerCase();
    const label: 'negative' | 'neutral' | 'positive' =
      lbl.includes('neg') ? 'negative' : lbl.includes('pos') ? 'positive' : 'neutral';

    return { label, score: best.score };
  } catch (error) {
    console.error('Error in sentimentMultilingual:', error);
    return { label: 'neutral', score: 0.33 };
  }
}

export function ruleSignals(text: string) {
  const t = text.toLowerCase();
  const sqUrgent = [
    'urgjent', 'sa më shpejt', 'sa me shpejt', 'menjëherë', 'menjehere',
    'sot', 'nesër', 'neser', 'tani', 'brenda ditës', 'brenda dites', 'brenda javës', 'brenda javes'
  ];
  const enUrgent = ['urgent', 'asap', 'right away', 'today', 'tomorrow', 'this week', 'by friday'];

  const timeRegex = /\b(\d+\s?(day|days|dit|dite|week|weeks|jav|jave)|24h|48h)\b/i;
  const weekDeadline = /\b(this week|këtë javë|kete jave|by (mon|tue|wed|thu|fri))\b/i;
  const budgetNow = /\b(budget|buxhet).*(now|ready|gati|tani)\b/i;

  let score = 0;
  const reasons: string[] = [];

  if (sqUrgent.some(k => t.includes(k)) || enUrgent.some(k => t.includes(k))) {
    score += 40; reasons.push('urgent_keyword');
  }
  if (timeRegex.test(t)) { score += 25; reasons.push('time_window'); }
  if (weekDeadline.test(t)) { score += 20; reasons.push('week_deadline'); }
  if (budgetNow.test(t)) { score += 10; reasons.push('budget_ready'); }
  if ((t.match(/\?/g)?.length ?? 0) >= 3) { score += 5; reasons.push('many_questions'); }

  return { ruleScore: score, reasons };
}

export function fuseUrgency(
  sentiment: Sentiment,
  ruleScore: number
) {
  const base = sentiment === Sentiment.NEGATIVE ? 35 : sentiment === Sentiment.NEUTRAL ? 15 : 10;
  const total = Math.min(100, Math.round(base + ruleScore));
  const band: Urgency = total >= 60 ? Urgency.HIGH : total >= 30 ? Urgency.MEDIUM : Urgency.LOW;
  return { urgency: band, score: total };
}

export async function classifyUrgency(text: string): Promise<Urgency> {
  const [{ label: sentiment }, { ruleScore }] = await Promise.all([
    sentimentMultilingual(text),
    Promise.resolve(ruleSignals(text))
  ]);
  return fuseUrgency(sentiment as Sentiment, ruleScore).urgency;
}

export async function classifyUrgencyFull(text: string): Promise<{
  urgency: Urgency; score: number; reasons: string[]; sentiment: Sentiment
}> {
  const [{ label: sentiment }, { ruleScore, reasons }] = await Promise.all([
    sentimentMultilingual(text),
    Promise.resolve(ruleSignals(text))
  ]);
  const { urgency, score } = fuseUrgency(sentiment as Sentiment, ruleScore);
  return { urgency, score, reasons, sentiment: sentiment as Sentiment };
}

export async function leadAttachUrgency(leadId: string, text: string) {
  const { urgency, score, reasons, sentiment } = await classifyUrgencyFull(text);
  const { data, error } = await supabase
    .from('leads')
    .update({ urgency, urgency_score: score, urgency_reasons: reasons, sentiment })
    .eq('id', leadId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}