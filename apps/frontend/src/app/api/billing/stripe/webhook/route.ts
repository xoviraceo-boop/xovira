import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { SubscriptionManager, CreditManager } from '@/features/billing/utils';
import { PAYMENT_METHOD, PAYMENT_GATEWAY } from '@/features/billing/types';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session.client_reference_id || session.metadata?.userId;

  if (!userId) {
    console.error('No user ID found in checkout session');
    return;
  }

  // Determine if this is a subscription or one-time payment
  if (session.mode === 'subscription') {
    // Handle subscription creation
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    await SubscriptionManager.activate(userId, {
      subId: subscription.id,
      planId: session.metadata?.planId || '',
      status: subscription.status,
      payment: {
        paymentId: session.payment_intent as string,
        paymentMethod: PAYMENT_METHOD.CREDIT_CARD,
        paymentGateway: PAYMENT_GATEWAY.STRIPE,
        paymentAmount: session.amount_total?.toString(),
        paymentCurrency: session.currency,
        paymentTime: new Date().toISOString(),
        nextPaymentTime: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
        paymentStatus: 'COMPLETED',
      },
      currentPeriodStart: subscription.current_period_start ? new Date(subscription.current_period_start * 1000).toISOString() : null,
      currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
      createdAt: new Date(subscription.created * 1000).toISOString(),
      updatedAt: new Date(subscription.created * 1000).toISOString(),
      metadata: {
        showModal: false,
        sessionId: session.id,
        customerId: subscription.customer as string,
        subscriptionId: subscription.id,
      }
    });
  } else if (session.mode === 'payment') {
    // Handle one-time payment
    const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
    await CreditManager.purchase(userId, {
      orderId: session.id,
      status: paymentIntent.status === 'succeeded' ? 'COMPLETED' : 'FAILED',
      packageId: session.metadata?.packageId || '',
      payment: {
        paymentId: paymentIntent.id,
        paymentMethod: PAYMENT_METHOD.CREDIT_CARD,
        paymentGateway: PAYMENT_GATEWAY.STRIPE,
        paymentAmount: paymentIntent.amount?.toString(),
        paymentCurrency: paymentIntent.currency,
        paymentTime: new Date().toISOString(),
        paymentStatus: paymentIntent.status === 'succeeded' ? 'COMPLETED' : 'FAILED',
      },
      metadata: {
        showModal: false,
        sessionId: session.id,
        customerId: paymentIntent.customer as string,
        paymentIntentId: paymentIntent.id,
      }
    });
  }

  // Create webhook queue entry
  try {
    await prisma.webhookQueue.create({
      data: {
        topic: event.type,
        userId: userId,
        payload: {
          id: event.id,
          type: event.type,
          data: event.data
        } as any,
        status: 'processed',
        processedAt: new Date()
      }
    });
  } catch (e) {
    console.warn('Failed to create webhook queue for Stripe webhook:', e);
  }
}

async function handleSubscriptionCreated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No user ID found in subscription metadata');
    return;
  }

  // Update subscription status
  await SubscriptionManager.updateSubscriptionMetadata(subscription.id, {
    showModal: false,
    eventType: 'subscription_created',
    subscriptionId: subscription.id,
    customerId: subscription.customer as string,
  });
}

async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No user ID found in subscription metadata');
    return;
  }

  // Update subscription status
  await SubscriptionManager.updateSubscriptionMetadata(subscription.id, {
    showModal: false,
    eventType: 'subscription_updated',
    subscriptionId: subscription.id,
    status: subscription.status,
  });
}

async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No user ID found in subscription metadata');
    return;
  }

  // Handle subscription cancellation
  await SubscriptionManager.updateSubscriptionMetadata(subscription.id, {
    showModal: false,
    eventType: 'subscription_cancelled',
    subscriptionId: subscription.id,
    cancelledAt: new Date().toISOString(),
  });
}

async function handleInvoicePaymentSucceeded(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const subscriptionId = invoice.subscription as string;

  if (subscriptionId) {
    await SubscriptionManager.updateSubscriptionMetadata(subscriptionId, {
      showModal: false,
      eventType: 'payment_succeeded',
      invoiceId: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
    });
  }
}

async function handleInvoicePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const subscriptionId = invoice.subscription as string;

  if (subscriptionId) {
    await SubscriptionManager.updateSubscriptionMetadata(subscriptionId, {
      showModal: false,
      eventType: 'payment_failed',
      invoiceId: invoice.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
    });
  }
}