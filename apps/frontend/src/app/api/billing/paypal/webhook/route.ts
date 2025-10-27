import { NextRequest, NextResponse } from 'next/server';
import { PaypalWebhookManager } from '@/features/billing/webhooks/paypal';
import { CreditManager } from '@/features/billing/utils/creditManager';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const event = JSON.parse(body);

    // Verify webhook signature
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const webhookId = process.env.PAYPAL_WEBHOOK_ID!;
    const isValid = await PaypalWebhookManager.verifyWebhookSignature(
      webhookId,
      headers,
      body
    );

    if (!isValid) {
      console.error('Invalid PayPal webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Queue webhook for async processing
    await PaypalWebhookManager.queueWebhook(event);

    // Process immediately (or you can use a background job)
    await PaypalWebhookManager.processWebhook(event);

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('PayPal webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

