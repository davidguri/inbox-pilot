import { PUBLIC_HF_BASE, PUBLIC_HF_TOKEN } from '$env/static/public';

export async function hf(model: string, payload: Record<string, unknown>) {
  const response = await fetch(`${PUBLIC_HF_BASE}/${model}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PUBLIC_HF_TOKEN}`,
      'Content-Type': 'application/json',
      "X-Use-Cache": "true"
    },
    body: JSON.stringify({
      ...payload,
      options: {
        wait_for_model: true
      }
    })
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data;
}