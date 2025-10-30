"use server";

import { client } from '@/lib/paypal/server';
import { CreditManager } from '@/features/billing/utils';
import { OrdersController } from '@paypal/paypal-server-sdk';
import { PAYMENT_GATEWAY, PAYMENT_METHOD } from '@/features/billing/types';

export async function POST(req: Request): Promise<Response> {
  try {
    const { orderID, userId } = await req.json();

    if (!orderID) {
      return new Response(JSON.stringify({ error: 'Missing orderID' }), { status: 400 });
    }
    const ordersController = new OrdersController(client);

    const { result } = await ordersController.captureOrder({
      id: orderID,
      prefer: 'return=representation',
    });

    const purchaseUnit = result.purchaseUnits?.[0];
    const capture = purchaseUnit?.payments?.captures?.[0];
    const packageId = purchaseUnit?.referenceId ?? "";
    if (!capture || !packageId) {
      throw new Error("Missing capture data from PayPal response.");
    }
    // Idempotency: avoid processing if order already exists
    const exists = await CreditManager.checkOrderExists(result.id ?? "");
    if (exists) {
      return new Response(JSON.stringify({ ok: true, message: 'Order already processed', id: result.id }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await CreditManager.purchase(userId, {
      orderId: result.id ?? "",
      status: result.status ?? "COMPLETED",
      packageId,
      payment: {
        paymentId: capture.id ?? "",
        paymentMethod: PAYMENT_METHOD.E_WALLET,
        paymentGateway: PAYMENT_GATEWAY.PAYPAL,
        paymentAmount: capture.amount?.value ?? null,
        paymentCurrency: capture.amount?.currencyCode ?? null,
        paymentTime: capture.createTime ?? null,
        paymentStatus: capture.status ?? null,
      },      
      metadata: {
        showModal: false,
        payer: result.payer ?? null,
        paymentSource: result.paymentSource ?? null,
        links: result.links ?? [],
      },
    });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('PayPal capture error:', error);
    return new Response(
      JSON.stringify({
        error: 'Capture failed',
        details: (error as Error).message,
      }),
      { status: 500 }
    );
  }
}
