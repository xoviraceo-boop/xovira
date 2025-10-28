import { NextRequest, NextResponse } from 'next/server';
import { PaypalWebhookManager } from '@/features/billing/webhooks/paypal';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let event;
    try {
      event = JSON.parse(rawBody);
    } catch {
      console.error('❌ Invalid JSON in webhook body');
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => (headers[key] = value));
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (!webhookId) {
      console.error('❌ PAYPAL_WEBHOOK_ID is not configured');
      return NextResponse.json(
        { error: 'Server misconfiguration' },
        { status: 500 }
      );
    }
    const isValid = await PaypalWebhookManager.verifyWebhookSignature(
      webhookId,
      headers,
      rawBody
    );
    if (!isValid) {
      console.error('❌ Invalid PayPal webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    console.log(`✅ PayPal Webhook Received: ${event.event_type}`);
    const permittedEvents: string[] = [
      'BILLING.SUBSCRIPTION.CREATED',
      'BILLING.SUBSCRIPTION.ACTIVATED',
      'BILLING.SUBSCRIPTION.UPDATED',
      'BILLING.SUBSCRIPTION.SUSPENDED',
      'BILLING.SUBSCRIPTION.CANCELLED',
      'BILLING.SUBSCRIPTION.EXPIRED',
      'PAYMENT.SALE.COMPLETED',
      'PAYMENT.SALE.DENIED',
      'PAYMENT.SALE.REFUNDED',
    ];
    if (!permittedEvents.includes(event.event_type)) {
      console.log(`⚠️ Unhandled PayPal event: ${event.event_type}`);
      return NextResponse.json({ message: 'Event ignored' }, { status: 200 });
    }
    try {
      await PaypalWebhookManager.queueWebhook(event);
      await PaypalWebhookManager.processWebhook(event);
      console.log(`✅ PayPal Webhook processed: ${event.event_type}`);
    } catch (err) {
      console.error(`🔥 Error processing PayPal event: ${event.event_type}`, err);
      return NextResponse.json(
        { error: 'Webhook processing failed' },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('💥 Unexpected PayPal webhook error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
