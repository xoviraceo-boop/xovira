import { NextRequest, NextResponse } from 'next/server';
import { StripeWebhookManager } from '@/features/billing/webhooks/stripe';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  let event: Stripe.Event;
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('❌ Missing Stripe signature header.');
      return NextResponse.json({ message: 'Missing signature' }, { status: 400 });
    }
    event = await StripeWebhookManager.verifyWebhookSignature(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`❌ Stripe Webhook Signature Verification Failed: ${message}`);
    return NextResponse.json({ message: `Webhook Error: ${message}` }, { status: 400 });
  }
  console.log(`✅ Stripe Webhook Received: ${event.type} (${event.id})`);
  const allowedEvents: string[] = [
    'checkout.session.completed',
    'payment_intent.succeeded',
    'payment_intent.payment_failed',
    'invoice.paid',
    'invoice.payment_failed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
  ];
  if (!allowedEvents.includes(event.type)) {
    console.log(`⚠️ Unhandled event type: ${event.type}`);
    return NextResponse.json({ message: 'Unhandled event type' }, { status: 200 });
  }
  try {
    await StripeWebhookManager.queueWebhook(event);
    await StripeWebhookManager.processWebhook(event);
    console.log(`✅ Webhook processed successfully for ${event.type}`);
  } catch (error: any) {
    console.error('🔥 Stripe Webhook Processing Failed:', error);
    return NextResponse.json(
      { message: error?.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
  return NextResponse.json({ message: 'Success' }, { status: 200 });
}
