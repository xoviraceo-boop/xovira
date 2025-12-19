import { Socket } from 'socket.io';

export function registerNotificationHandlers(io: any, socket: Socket) {
  socket.on('notification:send', async (data: { userId: string; notificationId?: string }) => {
    try {
      if (!data?.userId) return;
      io.to(`user:${data.userId}`).emit('notification:new', { notificationId: data.notificationId });
    } catch (error) {
      console.error('Error broadcasting notification', error);
    }
  });
}


