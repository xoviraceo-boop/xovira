"use client";

import React from "react";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.STRIPE_PUBLIC_KEY);

export const StripeClientProvider = ({ mode, children }) => {
  const options = {
    mode: mode || 'payment',
    currency: 'usd',
    amount: 99
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
};

export default StripeClientProvider;
