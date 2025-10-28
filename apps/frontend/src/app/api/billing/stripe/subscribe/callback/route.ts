import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { SubscriptionManager } from '@/features/billing/utils/subscriptionManager';
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
    const planId = session.metadata?.planId;
    if (!userId || !planId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing/upgrade?error=missing_metadata`
      );
    }
    if (session.payment_status === 'paid' && session.status === 'complete') {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

      if (subscription) {
        // @ts-ignore: Property 'current_period_start' may not exist on Response<Subscription>
        const currentPeriodStartTimestamp = subscription.current_period_start;
        // @ts-ignore: Property 'current_period_end' may not exist on Response<Subscription>
        const currentPeriodEndTimestamp = subscription.current_period_end;

        // 1. Define the Date object for the start time for safe arithmetic
        const currentPeriodStartDateObject = currentPeriodStartTimestamp
            ? new Date(currentPeriodStartTimestamp * 1000)
            : new Date();

        // 2. Define the ISO string for the SubscriptionManager
        const currentPeriodStart = currentPeriodStartDateObject.toISOString();

        // 3. Calculate currentPeriodEnd safely
        const currentPeriodEnd = currentPeriodEndTimestamp
            ? new Date(currentPeriodEndTimestamp * 1000).toISOString()
            // Use the Date object (.getTime()) for arithmetic, then convert to ISO string
            : new Date(currentPeriodStartDateObject.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

        await SubscriptionManager.activate(userId, {
          subId: subscription.id,
          planId,
          status: subscription.status?.toUpperCase() || 'ACTIVE',
          payment: {
            paymentId: session.payment_intent as string,
            paymentMethod: PAYMENT_METHOD.CREDIT_CARD,
            paymentGateway: PAYMENT_GATEWAY.STRIPE,
            paymentAmount: session.amount_total ? session.amount_total / 100 : 0,
            paymentCurrency: session.currency?.toUpperCase() || 'USD',
            paymentTime: currentPeriodStart,
            nextPaymentTime: currentPeriodEnd,
            paymentStatus: session.payment_status?.toUpperCase() || 'SUCCEEDED',
          },
          currentPeriodStart,
          currentPeriodEnd,
          createdAt: subscription.created
            ? new Date(subscription.created * 1000).toISOString()
            : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {
            stripeCheckoutSessionId: session.id,
            paymentIntentId: session.payment_intent,
            discounts: session.discounts || [],
            payer: {
              id: session.customer,
              details: session.customer_details,
              email: session.customer_details?.email || session.customer_email || null,
            },
            showModal: false,
          },
        });
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing/status?method=subscription&subId=${subscription.id}&status=success`
        );
      }
    }
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing/upgrade?error=payment_failed`
    );
  } catch (error) {
    console.error('Stripe subscription callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing/upgrade?error=callback_error`
    );
  }
}
