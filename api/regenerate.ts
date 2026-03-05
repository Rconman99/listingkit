import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from './_lib/redis';
import { callGemini } from './_lib/gemini';
import { SYSTEM_PROMPT, buildMlsPrompt, buildSocialPrompt, buildEmailPrompt, buildFlyerPrompt, buildVideoPrompt } from '../src/lib/prompts';
import { parseSocialOutput, parseEmailOutput } from '../src/lib/parsers';
import type { PropertyInput } from '../src/lib/types';

type OutputKey = 'mls' | 'social' | 'email' | 'flyer' | 'video';

const promptMap: Record<OutputKey, (p: PropertyInput) => string> = {
  mls: buildMlsPrompt,
  social: buildSocialPrompt,
  email: buildEmailPrompt,
  flyer: buildFlyerPrompt,
  video: buildVideoPrompt,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { property, outputKey, sessionId } = req.body as {
    property: PropertyInput;
    outputKey: OutputKey;
    sessionId: string;
  };

  if (!property || !outputKey || !sessionId) {
    return res.status(400).json({ error: 'Missing property, outputKey, or sessionId' });
  }

  if (!promptMap[outputKey]) {
    return res.status(400).json({ error: 'Invalid outputKey' });
  }

  // Verify session exists (but don't deduct — regeneration is free)
  await getSession(sessionId);

  const result = await callGemini(SYSTEM_PROMPT, promptMap[outputKey](property));

  if (result.status === 'rate_limited') {
    return res.status(429).json({ error: 'AI rate limited — try again in a minute.' });
  }

  if (result.status === 'error') {
    return res.status(200).json({ output: { status: 'error', message: result.message } });
  }

  // Parse output based on type
  if (outputKey === 'social') {
    return res.status(200).json({
      output: { status: 'success', posts: parseSocialOutput(result.text!) },
    });
  }

  if (outputKey === 'email') {
    return res.status(200).json({
      output: { status: 'success', parsed: parseEmailOutput(result.text!), raw: result.text! },
    });
  }

  return res.status(200).json({
    output: { status: 'success', text: result.text! },
  });
}
