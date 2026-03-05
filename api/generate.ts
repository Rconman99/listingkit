import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession, setSession } from './_lib/redis';
import { callGemini } from './_lib/gemini';
import { SYSTEM_PROMPT, buildMlsPrompt, buildSocialPrompt, buildEmailPrompt, buildFlyerPrompt, buildVideoPrompt } from '../src/lib/prompts';
import { parseSocialOutput, parseEmailOutput } from '../src/lib/parsers';
import type { PropertyInput } from '../src/lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { property, sessionId } = req.body as { property: PropertyInput; sessionId: string };
  if (!property || !sessionId) return res.status(400).json({ error: 'Missing property or sessionId' });

  // Check credits
  const session = await getSession(sessionId);
  if (session.used >= session.limit) {
    return res.status(403).json({
      error: 'No credits remaining',
      credits: { tier: session.tier, used: session.used, remaining: 0, limit: session.limit, resetDate: session.resetDate },
    });
  }

  // Fire all 5 Gemini calls in parallel
  const system = SYSTEM_PROMPT;
  const [mlsRes, socialRes, emailRes, flyerRes, videoRes] = await Promise.allSettled([
    callGemini(system, buildMlsPrompt(property)),
    callGemini(system, buildSocialPrompt(property)),
    callGemini(system, buildEmailPrompt(property)),
    callGemini(system, buildFlyerPrompt(property)),
    callGemini(system, buildVideoPrompt(property)),
  ]);

  const unwrap = (settled: PromiseSettledResult<Awaited<ReturnType<typeof callGemini>>>) => {
    if (settled.status === 'rejected') return { status: 'error' as const, message: 'Request failed' };
    return settled.value;
  };

  const mls = unwrap(mlsRes);
  const social = unwrap(socialRes);
  const email = unwrap(emailRes);
  const flyer = unwrap(flyerRes);
  const video = unwrap(videoRes);

  // If any call was rate limited, don't deduct credit
  const anyRateLimited = [mls, social, email, flyer, video].some(r => r.status === 'rate_limited');
  if (anyRateLimited) {
    return res.status(429).json({ error: 'AI rate limited — try again in a minute. No credit was used.' });
  }

  // Deduct credit
  session.used += 1;
  await setSession(sessionId, session);

  // Build typed results
  const mlsOutput = mls.status === 'success'
    ? { status: 'success' as const, text: mls.text! }
    : { status: 'error' as const, message: mls.message || 'Failed' };

  const socialOutput = social.status === 'success'
    ? { status: 'success' as const, posts: parseSocialOutput(social.text!) }
    : { status: 'error' as const, message: social.message || 'Failed' };

  const emailOutput = email.status === 'success'
    ? { status: 'success' as const, parsed: parseEmailOutput(email.text!), raw: email.text! }
    : { status: 'error' as const, message: email.message || 'Failed' };

  const flyerOutput = flyer.status === 'success'
    ? { status: 'success' as const, text: flyer.text! }
    : { status: 'error' as const, message: flyer.message || 'Failed' };

  const videoOutput = video.status === 'success'
    ? { status: 'success' as const, text: video.text! }
    : { status: 'error' as const, message: video.message || 'Failed' };

  return res.status(200).json({
    results: {
      mls: mlsOutput,
      social: socialOutput,
      email: emailOutput,
      flyer: flyerOutput,
      video: videoOutput,
      generatedAt: new Date().toISOString(),
      property,
    },
    credits: {
      tier: session.tier,
      used: session.used,
      remaining: session.limit - session.used,
      limit: session.limit,
      resetDate: session.resetDate,
    },
  });
}
