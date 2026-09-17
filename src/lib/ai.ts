import { PropertyInput, GenerationResult, CreditInfo, OutputKey } from './types';

import { projectGenerationInput } from './publicFacts';

interface GenerateResponse {
  results: GenerationResult;
  credits: CreditInfo;
}

interface RegenerateResponse {
  output: unknown;
}

export async function generateViaProxy(
  property: PropertyInput,
  sessionId: string
): Promise<{ results: GenerationResult; credits: CreditInfo }> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ property: projectGenerationInput(property), sessionId }),
  });

  if (res.status === 403) {
    await res.json(); // drain body
    throw new Error('NO_CREDITS');
  }

  if (res.status === 429) {
    throw new Error('AI is busy — please try again in a minute. No credit was used.');
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Server error ${res.status}`);
  }

  return (await res.json()) as GenerateResponse;
}

export async function regenerateViaProxy(
  property: PropertyInput,
  outputKey: OutputKey,
  sessionId: string
): Promise<unknown> {
  const res = await fetch('/api/regenerate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ property: projectGenerationInput(property), outputKey, sessionId }),
  });

  if (res.status === 429) {
    throw new Error('AI is busy — please try again in a minute.');
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Server error ${res.status}`);
  }

  const data = (await res.json()) as RegenerateResponse;
  return data.output;
}

export async function getCredits(sessionId: string): Promise<CreditInfo> {
  const res = await fetch(`/api/credits?sessionId=${encodeURIComponent(sessionId)}`);
  if (!res.ok) {
    return { tier: 'free', used: 0, remaining: 3, limit: 3 };
  }
  return (await res.json()) as CreditInfo;
}

export async function createCheckoutSession(sessionId: string): Promise<string> {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to create checkout session');
  }

  const data = await res.json();
  return data.url;
}
