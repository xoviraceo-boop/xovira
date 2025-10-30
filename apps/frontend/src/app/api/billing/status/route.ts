import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionManager } from '@/features/billing/utils/subscriptionManager';
import { CreditManager } from '@/features/billing/utils/creditManager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const method = searchParams.get('method'); // 'subscription' or 'checkout'
    const subId = searchParams.get('subId'); // subscription ID for subscriptions
    const orderId = searchParams.get('orderId'); // order ID for one-time purchases
    const status = searchParams.get('status'); // payment status

    if (!method || (!subId && !orderId) || !status) {
      return NextResponse.json(
        { error: 'Missing required parameters: method, subId/orderId, and status' },
        { status: 400 }
      );
    }

    let exists = false;
    let shouldShowModal = false;

    if (method === 'subscription' && subId) {
      // Check if subscription exists
      exists = await SubscriptionManager.checkSubscriptionExists(subId);
      
      if (exists && status === 'success') {
        // Update metadata to prevent showing modal again
        await SubscriptionManager.updateSubscriptionMetadata(subId, {
          showModal: false,
          lastStatusCheck: new Date().toISOString()
        });
        shouldShowModal = true;
      }
    } else if (method === 'checkout' && orderId) {
      // Check if order exists
      exists = await CreditManager.checkOrderExists(orderId);
      
      if (exists && status === 'success') {
        // Update metadata to prevent showing modal again
        await CreditManager.updateOrderMetadata(orderId, {
          showModal: false,
          lastStatusCheck: new Date().toISOString()
        });
        shouldShowModal = true;
      }
    }

    return NextResponse.json({
      exists,
      shouldShowModal,
      status,
      method,
      id: subId || orderId
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error checking billing status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { method, subId, orderId } = body;

    if (!method || (!subId && !orderId)) {
      return NextResponse.json(
        { error: 'Missing required parameters: method and subId/orderId' },
        { status: 400 }
      );
    }

    // Update metadata to mark modal as shown
    if (method === 'subscription' && subId) {
      await SubscriptionManager.updateSubscriptionMetadata(subId, {
        showModal: false,
        modalShownAt: new Date().toISOString()
      });
    } else if (method === 'checkout' && orderId) {
      await CreditManager.updateOrderMetadata(orderId, {
        showModal: false,
        modalShownAt: new Date().toISOString()
      });
    }

    return NextResponse.json({ success: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error updating billing status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}