import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { getRedis, setSession, type SessionData } from './_lib/redis';

export const config = {
  api: { bodyParser: false },
};

async function buffer(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const sig = req.headers['stripe-signature'] as string;
  const body = await buffer(req);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  const redis = getRedis();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const sessionId = session.metadata?.sessionId;
    if (sessionId) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const data: SessionData = {
        tier: 'pro',
        used: 0,
        limit: 100,
        stripeCustomerId: session.customer as string,
        resetDate: nextMonth.toISOString(),
      };
      await setSession(sessionId, data);
    }
  }

  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = invoice.customer as string;
    // Find session by customer ID
    const sessionId = await findSessionByCustomer(redis, customerId);
    if (sessionId) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const data: SessionData = {
        tier: 'pro',
        used: 0,
        limit: 100,
        stripeCustomerId: customerId,
        resetDate: nextMonth.toISOString(),
      };
      await setSession(sessionId, data);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;
    const sessionId = await findSessionByCustomer(redis, customerId);
    if (sessionId) {
      const data: SessionData = { tier: 'free', used: 0, limit: 3 };
      await setSession(sessionId, data);
    }
  }

  return res.status(200).json({ received: true });
}

async function findSessionByCustomer(redis: ReturnType<typeof getRedis>, customerId: string): Promise<string | null> {
  // Scan for sessions with this customer ID
  // In production with many users, you'd maintain a reverse index
  // For now, scan works fine at launch scale
  let cursor = 0;
  do {
    const [nextCursor, keys] = await redis.scan(cursor, { match: 'session:*', count: 100 });
    cursor = nextCursor;
    for (const key of keys) {
      const data = await redis.get<SessionData>(key);
      if (data?.stripeCustomerId === customerId) {
        return key.replace('session:', '');
      }
    }
  } while (cursor !== 0);
  return null;
}
