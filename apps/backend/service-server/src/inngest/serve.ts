import { serve } from 'inngest/express';
import { inngest } from '@/lib/inngest';
import { executeAgent } from './functions/agent-execution';

// Create Inngest serve handler
export const inngestHandler = serve({
  client: inngest,
  functions: [
    executeAgent,
  ],
});

