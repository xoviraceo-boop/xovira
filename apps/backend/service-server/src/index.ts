import 'reflect-metadata';
import cors from 'cors';
import { json } from 'express';
import { createAdapter } from '@socket.io/redis-adapter';
import { NestFactory } from '@nestjs/core';
import { Server } from 'socket.io';
import env from './config/env';
import { redis, redisPub, redisSub } from '@/lib/redis';
import { authMiddleware } from './middleware/auth';
import { registerPostHandlers } from './handlers/postHandlers';
import { registerCommentHandlers } from './handlers/commentHandlers';
import { registerFeedHandlers } from './handlers/feedHandlers';
import { registerTypingHandlers } from './handlers/typingHandlers';
import { registerNotificationHandlers } from './handlers/notificationHandlers';
import { registerMessageHandlers } from './handlers/messageHandlers';
import { registerChannelHandlers } from './handlers/channelHandlers';
import { PresenceService } from './services/socket/presenceService';
import { AppModule } from './app.module';
import { inngestHandler } from './inngest/serve';
import { startMatchingScheduler } from './services/matching/processors/schedule';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData
} from '@xovira/types';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: false,
  });

  app.use(json({ limit: '1mb' }));
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(','),
      credentials: true,
    })
  );

  // Inngest webhook endpoint
  app.use('/api/inngest', inngestHandler);

  const httpServer = app.getHttpServer();

  const io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN.split(','),
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.adapter(createAdapter(redisPub, redisSub));
  io.use(authMiddleware);

  redisSub.subscribe('notifications').catch((err) => {
    console.error('Failed to subscribe to notifications channel', err);
  });

  redisSub.on('message', (channel, message) => {
    if (channel !== 'notifications') return;
    try {
      const payload = JSON.parse(message);
      const { userId, notification } = payload;
      if (!userId || !notification) return;
      io.to(`user:${userId}`).emit('notification:new', { notification });
    } catch (err) {
      console.error('Error handling notification message', err);
    }
  });

  io.on('connection', async (socket) => {
    console.log(`✅ User connected: ${socket.data.userId} (${socket.id})`);

    try {
      await PresenceService.setUserOnline(socket.data.userId, socket.id);

      await socket.join(`user:${socket.data.userId}`);

      io.emit('user:online', {
        userId: socket.data.userId,
        username: socket.data.username,
        timestamp: new Date().toISOString(),
      });

      registerPostHandlers(io, socket);
      registerCommentHandlers(io, socket);
      registerFeedHandlers(io, socket);
      registerTypingHandlers(io, socket);
      registerNotificationHandlers(io, socket);
      registerMessageHandlers(io, socket);
      registerChannelHandlers(io, socket);

      socket.on('disconnect', async (reason) => {
        console.log(`❌ User disconnected: ${socket.data.userId} (${reason})`);

        try {
          await PresenceService.setUserOffline(socket.data.userId, socket.id);
          const isStillOnline = await PresenceService.isUserOnline(socket.data.userId);

          if (!isStillOnline) {
            io.emit('user:offline', {
              userId: socket.data.userId,
              username: socket.data.username,
              timestamp: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error('Error handling disconnect:', error);
        }
      });
    } catch (error) {
      console.error('Error in connection handler:', error);
      socket.disconnect();
    }
  });

  try {
    await startMatchingScheduler();
    console.log('[service-server] startup matching job enqueued');
  } catch (error) {
    console.error('[service-server] startup matching trigger failed', error);
  }

  // Sync tools and triggers to database on startup
  /*try {
    const { syncToolsToDatabase } = await import('./services/agents/toolRegistry');
    await syncToolsToDatabase();
    console.log('[service-server] Tools synced to database');
  } catch (error) {
    console.error('[service-server] Failed to sync tools to database', error);
  }*/

  try {
    const { syncTriggersToDatabase } = await import('./services/agents/triggerRegistry');
    await syncTriggersToDatabase();
    console.log('[service-server] Triggers synced to database');
  } catch (error) {
    console.error('[service-server] Failed to sync triggers to database', error);
  }

  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing server...');

    io.close(() => {
      console.log('Socket.IO server closed');
    });

    await redis.quit();
    await redisPub.quit();
    await redisSub.quit();

    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, closing server...');

    io.close(() => {
      console.log('Socket.IO server closed');
    });

    await redis.quit();
    await redisPub.quit();
    await redisSub.quit();

    process.exit(0);
  });

  const PORT = parseInt(env.PORT, 10);

  await app.listen(PORT, () => {
    console.log(`🚀 Nest server running on port ${PORT}`);
    console.log(`📡 Environment: ${env.NODE_ENV}`);
    console.log(`🔗 CORS Origin: ${env.CORS_ORIGIN}`);
  });
}

bootstrap();