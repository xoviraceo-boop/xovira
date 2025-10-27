import { PaypalWebhookManager } from '@/features/billing/utils/paypalWebhookManager';
import { StripeWebhookManager } from '@/features/billing/utils/stripeWebhookManager';

async function processWebhookQueue() {
  console.log('[CRON] Starting webhook queue processing...');
  
  try {
    await Promise.all([
      PaypalWebhookManager.processQueue(50),
      StripeWebhookManager.processQueue(50)
    ]);
    
    console.log('[CRON] Queue processed successfully');
  } catch (error) {
    console.error('[CRON] Error processing queue:', error);
  }
}

async function retryFailedWebhooks() {
  console.log('[CRON] Retrying failed webhooks...');
  
  try {
    await PaypalWebhookManager.retryFailed();
    console.log('[CRON] Failed webhooks queued for retry');
  } catch (error) {
    console.error('[CRON] Error retrying failed webhooks:', error);
  }
}

// Run every 5 minutes
setInterval(processWebhookQueue, 5 * 60 * 1000);

// Run every 6 hours
setInterval(retryFailedWebhooks, 6 * 60 * 60 * 1000);

// Initial run
processWebhookQueue();
retryFailedWebhooks();