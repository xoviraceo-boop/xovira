import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionManager, CreditManager } from "@/features/billing/utils";
import { PAYMENT_METHOD, PAYMENT_GATEWAY } from "@/features/billing/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, subscriptionDetails } = body;
    if (!subscriptionDetails) {
      return NextResponse.json(
        { error: 'Failed to get subscription details' },
        { status: 400 }
      );
    }
    const subId = subscriptionDetails.id as string;
    const planId = subscriptionDetails.plan_id;
    const billingInfo = subscriptionDetails.billing_info ?? {};
    const lastPayment = billingInfo.last_payment ?? {};
    const nextBillingTime = billingInfo.next_billing_time ?? null;
    if (!userId || !subId || !planId) {
      return NextResponse.json(
        { error: 'Missing required subscription information' },
        { status: 400 }
      );
    }
    await SubscriptionManager.activate(userId, {
      subId,
      planId,
      status: (subscriptionDetails.status as string) || 'ACTIVE',
      payment: {
        paymentId: lastPayment?.id,
        paymentMethod: PAYMENT_METHOD.E_WALLET,
        paymentGateway: PAYMENT_GATEWAY.PAYPAL,
        paymentAmount: lastPayment?.amount?.value ?? null,
        paymentCurrency: lastPayment?.amount?.currency_code ?? null,
        paymentTime: lastPayment?.time ?? null,
        nextPaymentTime: nextBillingTime,
        paymentStatus: lastPayment?.status ?? null,
      },
      currentPeriodStart: subscriptionDetails.start_time,
      currentPeriodEnd: nextBillingTime,
      createdAt: subscriptionDetails.create_time as (string | undefined),
      updatedAt: subscriptionDetails.update_time as (string | undefined),
      metadata: {
        eventType: 'subscription_activated',
        subscriber: subscriptionDetails.subscriber ?? null,
        quantity: subscriptionDetails.quantity ?? null,
        shippingAmount: subscriptionDetails.shipping_amount ?? null,
        billingInfo,
        links: subscriptionDetails.links ?? [],
        showModal: false
      }
    })
    return NextResponse.json({
      success: true,
      data: { subId, planId }
    });
  } catch (error) {
    console.error('Subscription activation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
