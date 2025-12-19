import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { SubscriptionManager } from '@/features/billing/utils';
import { DateTime } from "luxon";

export async function POST(request: NextRequest) {
  try {
    const { userId, subscriptionId, reason } = await request.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "User not authenticated" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Missing subscription ID' },
        { status: 400 }
      );
    }

    // Cancel the subscription in Stripe
    const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);

    await SubscriptionManager.cancel(userId, {
      subscriptionId,
      reason,
      canceledAt: DateTime.now(),
    });

    return NextResponse.json({
      success: true,
      data: {
        subscriptionId: canceledSubscription.id,
        status: canceledSubscription.status,
        canceledAt: canceledSubscription.canceled_at
      }
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Stripe cancellation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
