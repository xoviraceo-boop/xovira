import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import type Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { event, params } = await request.json();
    const { userId, priceId, quantity, trial_period_days, planId } = params;
    const trialEnd = typeof trial_period_days === 'number' && trial_period_days > 0
      ? Math.floor((Date.now() + trial_period_days * 24 * 60 * 60 * 1000) / 1000)
      : undefined;
    const options: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity
        }
      ],
      subscription_data: {
        ...(trialEnd ? { trial_end: trialEnd } : {}),
        metadata: {
          userId: userId || '',
          planId: planId || '',
        }
      },
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/billing/stripe/subscribe/callback?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing/upgrade`,
      client_reference_id: userId || undefined,
      metadata: {
        billingType: 'SUBSCRIPTION',
        planId: planId || '',
        userId: userId || '',
      }
    };
    const checkoutSession: Stripe.Checkout.Session = await stripe.checkout.sessions.create(options);
    return NextResponse.json({ result: checkoutSession, ok: true });
  } catch (error) {
    console.error('Stripe subscribe error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}


