import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from './_lib/redis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const sessionId = req.query.sessionId as string;
  if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });

  const session = await getSession(sessionId);

  return res.status(200).json({
    tier: session.tier,
    used: session.used,
    remaining: session.limit - session.used,
    limit: session.limit,
    resetDate: session.resetDate,
  });
}
