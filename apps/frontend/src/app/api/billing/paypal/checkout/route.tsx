import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { client } from '@/lib/paypal/server';
import { OrdersController, CheckoutPaymentIntent, OrderApplicationContextUserAction, OrderApplicationContextShippingPreference } from '@paypal/paypal-server-sdk';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { userId, pkg } = payload;

    const ordersController = new OrdersController(client);

    const { result } = await ordersController.createOrder({
      prefer: 'return=minimal',
      body: {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
          {
            amount: {
              currencyCode: 'USD',
              value: pkg.price.toFixed(2),
            },
            customId: userId,
            description: pkg.description || pkg.name,
            referenceId: pkg.id,
          },
        ],
        applicationContext: {
          returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing/upgrade?client=success`,
          cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing/upgrade?client=cancel`,
          brandName: process.env.NEXT_PUBLIC_BRAND_NAME || 'Xovira',
          userAction: OrderApplicationContextUserAction.PayNow,
          shippingPreference: OrderApplicationContextShippingPreference.NoShipping,
        },
      },
    });

    return NextResponse.json(result, { status: 201 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Payment processing error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation failed', errors: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Unexpected error occurred' },
      { status: 500 }
    );
  }
}
