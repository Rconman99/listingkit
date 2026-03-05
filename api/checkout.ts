import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { getSession, setSession } from './_lib/redis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { sessionId } = req.body as { sessionId: string };
  if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  // Reuse existing Stripe customer if session already has one
  const session = await getSession(sessionId);
  let customerId = session.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: { sessionId },
    });
    customerId = customer.id;
    session.stripeCustomerId = customerId;
    await setSession(sessionId, session);
  }

  const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || 'https://listingkit.co';

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    metadata: { sessionId },
    success_url: `${origin}/#/generate?upgraded=true`,
    cancel_url: `${origin}/#/generate`,
  });

  return res.status(200).json({ url: checkoutSession.url });
}
