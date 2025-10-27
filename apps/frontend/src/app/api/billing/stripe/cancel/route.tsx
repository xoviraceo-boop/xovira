import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { stripe } from '@/lib/stripe/server';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'User not authenticated' }), { status: 401 });
    }
    const { subscriptionId, reason } = await req.json();
    if (!subscriptionId) {
      return new Response(JSON.stringify({ error: 'Missing subscriptionId' }), { status: 400 });
    }

    const canceled = await stripe.subscriptions.cancel(subscriptionId, {
      cancellation_details: reason ? { comment: reason } : undefined
    } as any);

    return new Response(JSON.stringify({ id: canceled.id, status: canceled.status }), { status: 200 });
  } catch (error) {
    console.error('Stripe cancel error:', error);
    return new Response(JSON.stringify({ error: 'Cancellation failed' }), { status: 500 });
  }
}


