import { AIOutput, AIConfig } from './types';

export async function generateContent(config: AIConfig, systemPrompt: string, userPrompt: string): Promise<AIOutput> {
  try {
    if (config.provider === 'openai') {
      return await callOpenAI(config, systemPrompt, userPrompt);
    } else {
      return await callAnthropic(config, systemPrompt, userPrompt);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    return { status: 'error', message };
  }
}

async function callOpenAI(config: AIConfig, system: string, user: string): Promise<AIOutput> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model, max_tokens: 1024,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 401) return { status: 'error', message: 'Invalid API key. Check your key in Settings.' };
    if (response.status === 429) return { status: 'error', message: 'Rate limited. Wait a moment and try again.' };
    return { status: 'error', message: err.error?.message || `API error ${response.status}` };
  }
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  if (!text) return { status: 'error', message: 'Empty response from API' };
  return { status: 'success', text };
}

async function callAnthropic(config: AIConfig, system: string, user: string): Promise<AIOutput> {
  let response: Response;
  try {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model, max_tokens: 1024,
        system: system,
        messages: [{ role: 'user', content: user }],
      }),
    });
  } catch {
    return { status: 'error', message: 'Connection failed — likely a CORS issue with Anthropic. Try switching to OpenAI in Settings.' };
  }
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    if (!err) return { status: 'error', message: 'CORS error — switch to OpenAI in Settings, or check Anthropic docs for browser access.' };
    if (response.status === 401) return { status: 'error', message: 'Invalid API key. Check your key in Settings.' };
    if (response.status === 429) return { status: 'error', message: 'Rate limited. Wait a moment and try again.' };
    return { status: 'error', message: err.error?.message || `API error ${response.status}` };
  }
  const data = await response.json();
  const text = data.content?.[0]?.text || '';
  if (!text) return { status: 'error', message: 'Empty response from API' };
  return { status: 'success', text };
}

export async function testConnection(config: AIConfig): Promise<{ success: boolean; message: string }> {
  const testConfig = { ...config };
  if (config.provider === 'openai') testConfig.model = 'gpt-4o-mini';
  if (config.provider === 'anthropic') testConfig.model = 'claude-haiku-4-5-20251001';
  const result = await generateContent(testConfig, 'You are a test assistant.', 'Reply with the single word OK');
  if (result.status === 'success') return { success: true, message: 'Connected successfully!' };
  return { success: false, message: result.status === 'error' ? result.message : 'Connection failed' };
}
