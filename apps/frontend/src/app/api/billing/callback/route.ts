import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionManager } from '@/utils/billing';
import { generateQueryParams } from '@/utils/auth/shopify';
import { PaymentStatus } from '@/types/billing';

export const maxDuration = 60; 

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get('shop');
    const host = searchParams.get('host');
    const charge_id = searchParams.get('charge_id');
    const status = searchParams.get('status') || PaymentStatus.SUCCEEDED;
    if (!shop || !host || !charge_id) {
      throw new Error('Missing required parameters');
    }
    await SubscriptionManager.updatePaymentStatus(
      shop,
      charge_id,
      status
    );
    const queryParams = generateQueryParams(shop, host);
    queryParams.set('payment_status', status);
    return NextResponse.redirect(
      `${process.env.SHOPIFY_API_URL}/shops/shop=${shop}?${queryParams.toString()}`
    );
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}