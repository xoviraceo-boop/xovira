import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { SubscriptionManager } from '@/features/billing/utils';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Missing subscription ID' },
        { status: 400 }
      );
    }

    // Cancel the subscription in Stripe
    const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);

    // Update the subscription in our database
    await SubscriptionManager.updateSubscriptionMetadata(subscriptionId, {
      showModal: false,
      eventType: 'subscription_cancelled',
      subscriptionId: subscriptionId,
      cancelledAt: new Date().toISOString(),
      stripeStatus: canceledSubscription.status,
    });

    // Create webhook queue entry
    try {
      await prisma.webhookQueue.create({
        data: {
          topic: 'customer.subscription.deleted',
          userId: 'system',
          payload: {
            id: `evt_${Date.now()}`,
            type: 'customer.subscription.deleted',
            data: { object: canceledSubscription }
          } as any,
          status: 'processed',
          processedAt: new Date()
        }
      });
    } catch (e) {
      console.warn('Failed to create webhook queue for Stripe cancel route:', e);
    }

    return NextResponse.json({
      success: true,
      data: {
        subscriptionId: canceledSubscription.id,
        status: canceledSubscription.status,
        canceledAt: canceledSubscription.canceled_at
      }
    });

  } catch (error) {
    console.error('Stripe cancellation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
