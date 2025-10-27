import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { SubscriptionManager } from '@/features/billing/utils/subscriptionManager';
import { PAYMENT_METHOD, PAYMENT_GATEWAY } from '@/features/billing/types';
import { prisma } from '@/lib/prisma';

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

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId as string);
    
    if (!session) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing/upgrade?error=session_not_found`
      );
    }

    // Extract metadata
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;

    if (!userId || !planId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing/upgrade?error=missing_metadata`
      );
    }

    // Check if session is completed
    if (session.payment_status === 'paid' && session.status === 'complete') {
      // Get subscription details
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      

      if (subscription) {
        // Activate subscription using SubscriptionManager
        await SubscriptionManager.activate(userId, {
          subId: subscription.id,
          planId,
          status: subscription.status.toUpperCase(),
          payment: {
            paymentId: session.payment_intent as string,
            paymentMethod: PAYMENT_METHOD.CREDIT_CARD,
            paymentGateway: PAYMENT_GATEWAY.STRIPE,
            paymentAmount: session.amount_total ? (session.amount_total / 100).toString() : null,
            paymentCurrency: session.currency || null,
            paymentTime: new Date().toISOString(),
            nextPaymentTime: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000).toISOString() : null,
            paymentStatus: session.payment_status.toUpperCase(),
          },
          currentPeriodStart: (subscription as any).current_period_start ? new Date((subscription as any).current_period_start * 1000).toISOString() : undefined,
          currentPeriodEnd: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000).toISOString() : undefined,
          createdAt: subscription.created ? new Date(subscription.created * 1000).toISOString() : undefined,
          updatedAt: new Date().toISOString(),
          metadata: {
            eventType: 'subscription_activated',
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscription.id,
            showModal: false
          }
        });

        // Create webhook queue entry
        try {
          await prisma.webhookQueue.create({
            data: {
              topic: 'BILLING.SUBSCRIPTION.ACTIVATED',
              userId: userId,
              payload: {
                id: subscription.id,
                event_type: 'BILLING.SUBSCRIPTION.ACTIVATED',
                resource_type: 'subscription',
                resource: subscription
              } as any,
              status: 'processed',
              processedAt: new Date()
            }
          });
        } catch (e) {
          console.warn('Failed to create webhook queue for Stripe subscription callback:', e);
        }

        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing/status?method=subscription&subId=${subscription.id}&status=success`
        );
      }
    }

    // If payment failed or session incomplete
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
