export interface GeminiResult {
  status: 'success' | 'error' | 'rate_limited';
  text?: string;
  message?: string;
}

export async function callGemini(systemPrompt: string, userPrompt: string): Promise<GeminiResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { status: 'error', message: 'Gemini API key not configured' };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: { maxOutputTokens: 1024 },
      }),
    }
  );

  if (response.status === 429) {
    return { status: 'rate_limited', message: 'AI is busy — please try again in a minute.' };
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    return { status: 'error', message: err.error?.message || `Gemini error ${response.status}` };
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!text) return { status: 'error', message: 'Empty response from AI' };
  return { status: 'success', text };
}
