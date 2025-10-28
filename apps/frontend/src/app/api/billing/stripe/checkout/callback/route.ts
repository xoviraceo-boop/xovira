import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { CreditManager } from '@/features/billing/utils/creditManager';
import { PAYMENT_METHOD, PAYMENT_GATEWAY } from '@/features/billing/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    const status = searchParams.get('status');

    if (!sessionId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing/upgrade?error=missing_session_id`
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId as string);
    
    if (!session) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing/upgrade?error=session_not_found`
      );
    }

    const userId = session.metadata?.userId;
    const packageId = session.metadata?.packageId;

    if (!userId || !packageId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing/upgrade?error=missing_metadata`
      );
    }

    if (session.payment_status === 'paid' && session.status === 'complete') {
      console.log("this is session", session);
      // Idempotency: avoid processing if order already exists
      const exists = await CreditManager.checkOrderExists(session.id);
      if (exists) {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing/status?method=checkout&orderId=${session.id}&status=success`
        );
      }

      await CreditManager.purchase(userId, {
        orderId: session.id,
        status: session.payment_status.toUpperCase(),
        packageId,
        payment: {
          paymentId: session.payment_intent as string,
          paymentMethod: PAYMENT_METHOD.E_WALLET,
          paymentGateway: PAYMENT_GATEWAY.STRIPE,
          paymentAmount: session.amount_total ? (session.amount_total / 100).toString() : null,
          paymentCurrency: session.currency || null,
          paymentTime: session.created
            ? new Date(session.created * 1000).toISOString()
            : new Date().toISOString(),
          paymentStatus: session.payment_status.toUpperCase(),
        },
        metadata: {
          showModal: false,
          discounts: session.discounts || [],
          paymentIntentId: session.payment_intent,
          stripeCheckoutSessionId: session.id,
          payer: {
            id: session.customer,
            details: session.customer_details,
            email: session.customer_details?.email || session.customer_email || null,
          }
        },
      });

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing/status?method=checkout&orderId=${session.id}&status=success`
      );
    }

    // If payment failed or session incomplete
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing/upgrade?error=payment_failed`
    );

  } catch (error) {
    console.error('Stripe checkout callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing/upgrade?error=callback_error`
    );
  }
}
