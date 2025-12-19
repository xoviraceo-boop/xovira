'use client';
import React, { useCallback } from 'react';
import axios from 'axios';
import { getStripe } from '@/lib/stripe/client';
import { Button } from '@/components/ui/button';

interface StripeButtonProps {
  event: { type: string };
  params: Record<string, any>;
  onError: (error?: any) => void;
  className?: string;
  buttonText?: string;
}

const StripeButton: React.FC<StripeButtonProps> = ({
  event,
  params,
  onError,
  className = "text-white cursor-pointer",
  buttonText = "PURCHASE",
}) => {
  const handleSubmit = useCallback(async () => {
    try {
      const stripe = await getStripe();
      if (!stripe) throw new Error('Stripe not initialized');
      const endpoint =
        event.type === "BILLING.PAYMENT.SUBSCRIPTION"
          ? '/api/billing/stripe/subscribe'
          : '/api/billing/stripe/checkout';
      const { data } = await axios.post(endpoint, { event, params });
      if (!data?.result?.url) {
        throw new Error('Invalid checkout session response');
      }
      window.location.href = data.result.url;
    } catch (error) {
      console.error('Stripe checkout error:', error);
      onError(error);
    }
  }, [event, params, onError]);

  return (
    <Button onClick={handleSubmit} className={className} aria-label="Purchase with Stripe">
      {buttonText}
    </Button>
  );
};

export default React.memo(StripeButton);
