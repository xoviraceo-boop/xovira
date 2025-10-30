import { PAYMENT_GATEWAY } from '@/features/billing/types';
import { stripe as stripeClient } from '@/lib/stripe/server';

interface IBillingState {
  loading: boolean;
  error: string | null;
  data: any | null;
}

interface StripePaymentIntent {
  client_secret: string | null;
  id: string;
}

type PlanType = 'STANDARD' | 'PRO' | 'ULTIMATE';

export class StripeService {
  private static stripe = stripeClient;
  private userId: string;

  private static state: IBillingState = {
    loading: false,
    error: null,
    data: null
  };

  private static setState(newState: Partial<IBillingState>) {
    this.state = { ...this.state, ...newState };
  }

  constructor(userId: string) {
    this.userId = userId;
  }
  
  static createParams(event: any, options: any) {
    const baseParams = {
      event,
      params: {
        priceId: options.priceId,
        quantity: options.quantity
      }
    };

    if (event.type === "BILLING.PAYMENT.SUBSCRIPTION") {
      return {
        ...baseParams,
        params: {
          ...baseParams.params,
          trial_end: this.calculateTrialEndUnixTimestamp(options.trial_period_days)
        }
      };
    }

    return baseParams;
  }

  private static calculateTrialEndUnixTimestamp(trialPeriodDays: number): number {
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + trialPeriodDays);
    return Math.floor(trialEndDate.getTime() / 1000);
  }

  public static getState(): IBillingState {
    return this.state;
  }
}