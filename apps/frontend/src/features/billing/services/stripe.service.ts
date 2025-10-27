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

  private static getPlanAmount(planType: PlanType): number {
    const amounts = {
      STANDARD: 0,
      PRO: 1500,
      ULTIMATE: 3500
    };
    return amounts[planType];
  }

  async createPaymentIntent(amount: number, stripeId?: string): Promise<StripePaymentIntent | undefined> {
    try {
      StripeService.setState({ loading: true, error: null });

      const paymentIntentOptions: any = {
        currency: 'usd',
        amount: amount * 100,
        automatic_payment_methods: {
          enabled: true,
        }
      };

      if (stripeId) {
        const paymentIntent = await StripeService.stripe.paymentIntents.create(
          paymentIntentOptions,
          { stripeAccount: stripeId }
        );
        StripeService.setState({ loading: false, data: paymentIntent });
        return { client_secret: paymentIntent.client_secret, id: paymentIntent.id };
      }

      const paymentIntent = await StripeService.stripe.paymentIntents.create(paymentIntentOptions);
      StripeService.setState({ loading: false, data: paymentIntent });
      return { client_secret: paymentIntent.client_secret, id: paymentIntent.id };

    } catch (error) {
      StripeService.setState({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Payment intent creation failed' 
      });
      console.error('Payment intent creation error:', error);
      throw error;
    }
  }

  async createSubscription(planType: PlanType): Promise<StripePaymentIntent | undefined> {
    try {
      const amount = StripeService.getPlanAmount(planType);
      return await this.createPaymentIntent(amount);
    } catch (error) {
      console.error('Subscription creation error:', error);
      throw error;
    }
  }

  async createOrder(productId: string, quantity: number): Promise<string> {
    try {
      StripeService.setState({ loading: true, error: null });

      const order = await StripeService.stripe.orders.create({
        currency: 'usd',
        items: [{
          type: 'sku',
          parent: productId,
          quantity: quantity,
        }],
      });

      StripeService.setState({ loading: false, data: order });
      return order.id;

    } catch (error) {
      StripeService.setState({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Order creation failed' 
      });
      console.error('Order creation error:', error);
      throw error;
    }
  }

  async capturePayment(paymentIntentId: string): Promise<any> {
    try {
      StripeService.setState({ loading: true, error: null });

      const paymentIntent = await StripeService.stripe.paymentIntents.capture(paymentIntentId);
      
      const paymentData = {
        userId: this.userId,
        chargeId: paymentIntent.id,
        providerName: PAYMENT_GATEWAY.STRIPE,
        status: paymentIntent.status,
      };

      // Note: CreditManager is referenced but not imported in original code
      // You may need to import it: import { CreditManager } from '@/lib/credit-manager';
      // await CreditManager.purchaseCredits(paymentData);
      
      StripeService.setState({ loading: false, data: paymentIntent });
      return paymentIntent;

    } catch (error) {
      StripeService.setState({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Payment capture failed' 
      });
      console.error('Payment capture error:', error);
      throw error;
    }
  }

  async onCancelSubscription(subscriptionId: string): Promise<void> {
    try {
      StripeService.setState({ loading: true, error: null });

      const canceledSubscription = await StripeService.stripe.subscriptions.cancel(subscriptionId);
      
      StripeService.setState({ loading: false, data: canceledSubscription });
      
    } catch (error) {
      StripeService.setState({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Subscription cancellation failed' 
      });
      console.error('Subscription cancellation error:', error);
      throw error;
    }
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