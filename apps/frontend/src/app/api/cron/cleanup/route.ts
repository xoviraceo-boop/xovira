/*import { type NextRequest } from 'next/server';
import { runUninstallWorker } from '@/utils/workers/uninstall_worker';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }
    await runUninstallWorker();
    return new Response('Uninstall queue processed successfully', { status: 200 });
  } catch (error) {
    console.error('Cron job error:', error);
    return new Response(`Error processing uninstall queue: ${error.message}`, { 
      status: 500 
    });
  }
}*/
