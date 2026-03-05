import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
  }
  return redis;
}

export interface SessionData {
  tier: 'free' | 'pro';
  used: number;
  limit: number;
  stripeCustomerId?: string;
  resetDate?: string; // ISO date string for pro tier monthly reset
}

const SESSION_PREFIX = 'session:';

export async function getSession(sessionId: string): Promise<SessionData> {
  const redis = getRedis();
  const data = await redis.get<SessionData>(`${SESSION_PREFIX}${sessionId}`);
  if (data) return data;
  // New session — create with free tier defaults
  const newSession: SessionData = { tier: 'free', used: 0, limit: 3 };
  await redis.set(`${SESSION_PREFIX}${sessionId}`, newSession);
  return newSession;
}

export async function setSession(sessionId: string, data: SessionData): Promise<void> {
  const redis = getRedis();
  await redis.set(`${SESSION_PREFIX}${sessionId}`, data);
}
