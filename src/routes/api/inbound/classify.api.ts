import { supabase } from '../../../supabase/supabase';
import { hf } from './hf.api';

enum Labels {
  SALES = 'sales',
  SUPPORT = 'support',
  SPAM = 'spam'
}

export async function classifyIntent(text: string) {
  try {
    const data = await hf('MoritzLaurer/mDeBERTa-v3-base-mnli-xnli', {
      inputs: text.slice(0, 2000),
      parameters: {
        candidate_labels: [Labels.SALES, Labels.SUPPORT, Labels.SPAM],
        multi_label: false
      }
    }) as { labels: string[]; scores: number[]; }[];

    if (!Array.isArray(data) || !data[0] || !data[0].labels || !data[0].labels[0]) {
      console.warn('Unexpected HF API response structure:', data);
      return Labels.SALES;
    }

    const intent = data[0].labels[0] as Labels;
    return intent;
  } catch (error) {
    console.error('Error in classifyIntent:', error);
    return Labels.SALES;
  }
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