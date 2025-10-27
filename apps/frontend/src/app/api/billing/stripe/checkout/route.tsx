import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import type Stripe from 'stripe';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const userName = session?.user?.name || '';
    const userEmail = session?.user?.email || undefined;

    const { event, params } = await request.json();
    
    const { priceId, quantity, packageId } = params;
    const options: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity
        }
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/billing/stripe/checkout/callback?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing/upgrade`,
      client_reference_id: userId || undefined,
      customer_email: userEmail,
      metadata: {
        billingType: 'ONE_TIME',
        packageId: packageId || '',
        userId: userId || '',
        userName: userName || ''
      }
    };
    const checkoutSession: Stripe.Checkout.Session = await stripe.checkout.sessions.create(options);
    return NextResponse.json({ result: checkoutSession, ok: true });
  } catch (error) {
    console.log(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}


