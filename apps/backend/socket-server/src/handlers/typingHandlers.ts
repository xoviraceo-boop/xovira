import { Socket } from 'socket.io';
import type { TypingData } from '@/types';

export function registerTypingHandlers(io: any, socket: Socket) {
  socket.on('typing:start', (data: TypingData) => {
    try {
      const room = data.postId ? `post:${data.postId}` : `comment:${data.commentId}`;
      
      socket.to(room).emit('user:typing', {
        userId: socket.data.userId,
        postId: data.postId,
        commentId: data.commentId,
      });

    } catch (error) {
      console.error('Error broadcasting typing start:', error);
    }
  });

  socket.on('typing:stop', (data: TypingData) => {
    try {
      const room = data.postId ? `post:${data.postId}` : `comment:${data.commentId}`;
      
      socket.to(room).emit('user:typing', {
        userId: socket.data.userId,
        postId: data.postId,
        commentId: data.commentId,
      });

    } catch (error) {
      console.error('Error broadcasting typing stop:', error);
    }
  });
}