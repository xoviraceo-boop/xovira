import { Socket } from 'socket.io';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase';

type ChannelMessagePayload = {
  id: string;
  channelId: string;
  content: string;
  attachments?: any[];
  replyTo?: { id: string; content?: string; userId?: string };
};

export function registerChannelHandlers(io: any, socket: Socket) {
  const userId = socket.data.userId as string;

  // Helper: ensure membership (includes channel owner)
  const ensureMember = async (channelId: string) => {
    const { data, error } = await supabaseAdmin
      .from('channel_members')
      .select('id')
      .eq('channel_id', channelId)
      .eq('user_id', userId)
      .maybeSingle();

    if (data && !error) return;

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      select: { createdBy: true, members: { select: { userId: true } } },
    });

    if (!channel) throw new Error('Channel not found');
    const isOwner = channel.createdBy === userId;
    const isMember = channel.members.some((m) => m.userId === userId);
    if (!isOwner && !isMember) throw new Error('Not a channel member');
  };

  // Create message
  socket.on('channel:message:create', async (payload: ChannelMessagePayload, ack?: (err: any, resp?: any) => void) => {
    try {
      if (!payload?.id || !payload.channelId || !(payload.content?.trim().length || payload.attachments?.length)) {
        throw new Error('Invalid payload');
      }

      await ensureMember(payload.channelId);

      const message = await prisma.channelMessage.create({
        data: {
          id: payload.id,
          channelId: payload.channelId,
          userId,
          content: payload.content || '',
          attachments: payload.attachments ?? [],
          parentId: payload.replyTo?.id ?? null,
          reactions: [],
        },
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      });

      const broadcastPayload = {
        id: message.id,
        channelId: message.channelId,
        userId: message.userId,
        content: message.content,
        attachments: message.attachments,
        parentId: message.parentId,
        reactions: message.reactions,
        createdAt: message.createdAt,
        user: message.user,
      };

      // Fan-out to channel room
      io.to(`channel:${message.channelId}`).emit('channel:message:received', broadcastPayload);
      // Echo back to sender
      socket.emit('channel:message:sent', broadcastPayload);

      // Also notify all channel members individually (include owner)
      const [memberIds, channel] = await Promise.all([
        prisma.channelMember.findMany({
          where: { channelId: message.channelId },
          select: { userId: true },
        }),
        prisma.channel.findUnique({ where: { id: message.channelId }, select: { createdBy: true } }),
      ]);

      const recipients = new Set<string>();
      memberIds.forEach((m) => recipients.add(m.userId));
      if (channel?.createdBy) recipients.add(channel.createdBy);

      recipients.forEach((uid) => {
        io.to(`user:${uid}`).emit('channel:message:received', broadcastPayload);
      });

      ack?.(null, broadcastPayload);
    } catch (err: any) {
      console.error('channel:message:create error', err);
      ack?.({ message: err?.message || 'Failed to send channel message' });
    }
  });

  // Reactions toggle
  socket.on(
    'channel:message:react',
    async (data: { messageId: string; emoji: string }, ack?: (err: any, resp?: any) => void) => {
      try {
        if (!data?.messageId || !data?.emoji) throw new Error('Invalid reaction payload');

        const message = await prisma.channelMessage.findUnique({
          where: { id: data.messageId },
          select: { id: true, channelId: true, reactions: true },
        });
        if (!message) throw new Error('Message not found');
        await ensureMember(message.channelId);

        const reactions = Array.isArray(message.reactions) ? [...(message.reactions as any[])] : [];
        const idx = reactions.findIndex((r: any) => r.userId === userId && r.emoji === data.emoji);
        if (idx >= 0) reactions.splice(idx, 1);
        else reactions.push({ userId, emoji: data.emoji });

        await prisma.channelMessage.update({
          where: { id: data.messageId },
          data: { reactions },
        });

        io.to(`channel:${message.channelId}`).emit('channel:message:reaction', {
          messageId: data.messageId,
          reactions,
        });
        ack?.(null, { messageId: data.messageId, reactions });
      } catch (err: any) {
        console.error('channel:message:react error', err);
        ack?.({ message: err?.message || 'Failed to react' });
      }
    }
  );

  // Mark read
  socket.on('channel:message:read', async (data: { channelId: string }, ack?: (err: any, resp?: any) => void) => {
    try {
      if (!data?.channelId) throw new Error('Invalid payload');
      await ensureMember(data.channelId);
      const now = new Date();
      await prisma.channelMember.updateMany({
        where: { channelId: data.channelId, userId },
        data: { lastReadAt: now },
      });
      io.to(`channel:${data.channelId}`).emit('channel:message:read:ack', {
        channelId: data.channelId,
        userId,
        at: now.toISOString(),
      });
      ack?.(null, { success: true });
    } catch (err: any) {
      console.error('channel:message:read error', err);
      ack?.({ message: err?.message || 'Failed to mark read' });
    }
  });

  // Join channel room helper
  socket.on('channel:join', async (data: { channelId: string }, ack?: (err: any, resp?: any) => void) => {
    try {
      if (!data?.channelId) throw new Error('Invalid payload');
      await ensureMember(data.channelId);
      await socket.join(`channel:${data.channelId}`);
      ack?.(null, { joined: true });
    } catch (err: any) {
      console.error('channel:join error', err);
      ack?.({ message: err?.message || 'Failed to join channel' });
    }
  });
}

