import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { CreditManager } from '@/features/billing/utils/creditManager';
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
    const packageId = session.metadata?.packageId;
    const userName = session.metadata?.userName;

    if (!userId || !packageId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing/upgrade?error=missing_metadata`
      );
    }

    // Check if session is completed
    if (session.payment_status === 'paid' && session.status === 'complete') {
      // Process credit purchase using CreditManager
      await CreditManager.purchase(userId, {
        orderId: session.id,
        status: session.payment_status,
        packageId,
        payment: {
          paymentId: session.payment_intent as string,
          paymentMethod: PAYMENT_METHOD.CREDIT_CARD,
          paymentGateway: PAYMENT_GATEWAY.STRIPE,
          paymentAmount: session.amount_total ? (session.amount_total / 100).toString() : null,
          paymentCurrency: session.currency || null,
          paymentTime: new Date().toISOString(),
          paymentStatus: session.payment_status,
        },
        metadata: {
          showModal: false,
          stripeCustomerId: session.customer as string,
          stripeSessionId: session.id,
        },
      });

      // Create webhook queue entry
      try {
        await prisma.webhookQueue.create({
          data: {
            topic: 'BILLING.PAYMENT.ORDER',
            userId: userId,
            payload: {
              id: session.id,
              event_type: 'BILLING.PAYMENT.ORDER',
              resource_type: 'order',
              resource: session
            } as any,
            status: 'processed',
            processedAt: new Date()
          }
        });
      } catch (e) {
        console.warn('Failed to create webhook queue for Stripe checkout callback:', e);
      }

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
