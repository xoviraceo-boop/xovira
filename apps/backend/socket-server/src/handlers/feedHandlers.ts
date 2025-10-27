import { Socket } from 'socket.io';
import type { SubscribeFeedData, UnsubscribeFeedData } from '@/types';

export function registerFeedHandlers(io: any, socket: Socket) {
  socket.on('feed:subscribe', async (data: SubscribeFeedData) => {
    try {
      let room: string;

      switch (data.feedType) {
        case 'global':
          room = 'feed:global';
          break;
        case 'user':
          room = `feed:user:${data.feedId || socket.data.userId}`;
          break;
        case 'project':
          if (!data.feedId) throw new Error('Project ID required');
          room = `feed:project:${data.feedId}`;
          break;
        case 'team':
          if (!data.feedId) throw new Error('Team ID required');
          room = `feed:team:${data.feedId}`;
          break;
        case 'proposal':
          if (!data.feedId) throw new Error('Proposal ID required');
          room = `feed:proposal:${data.feedId}`;
          break;
        default:
          throw new Error('Invalid feed type');
      }

      await socket.join(room);
      console.log(`Socket ${socket.id} joined room: ${room}`);

    } catch (error) {
      console.error('Error subscribing to feed:', error);
      socket.emit('error', { 
        message: error instanceof Error ? error.message : 'Failed to subscribe to feed' 
      });
    }
  });

  socket.on('feed:unsubscribe', async (data: UnsubscribeFeedData) => {
    try {
      let room: string;

      switch (data.feedType) {
        case 'global':
          room = 'feed:global';
          break;
        case 'user':
          room = `feed:user:${data.feedId || socket.data.userId}`;
          break;
        case 'project':
          if (!data.feedId) throw new Error('Project ID required');
          room = `feed:project:${data.feedId}`;
          break;
        case 'team':
          if (!data.feedId) throw new Error('Team ID required');
          room = `feed:team:${data.feedId}`;
          break;
        case 'proposal':
          if (!data.feedId) throw new Error('Proposal ID required');
          room = `feed:proposal:${data.feedId}`;
          break;
        default:
          throw new Error('Invalid feed type');
      }

      await socket.leave(room);
      console.log(`Socket ${socket.id} left room: ${room}`);

    } catch (error) {
      console.error('Error unsubscribing from feed:', error);
      socket.emit('error', { 
        message: error instanceof Error ? error.message : 'Failed to unsubscribe from feed' 
      });
    }
  });
}