import { Socket } from 'socket.io';
import { supabaseAdmin } from '@/lib/supabase';

export function registerMessageHandlers(io: any, socket: Socket) {
  console.log('🔌 Message handlers registered for user:', socket.data.userId);

  socket.on('message:create', async (data: { id: string; toUserId: string; content: string; attachments?: string[]; replyTo?: { id: string; content?: string; senderId?: string } }, ack?: (err: any, response?: any) => void) => {
    console.log('📥 message:create received:', { from: socket.data.userId, to: data.toUserId });
    
    try {
      const userId = socket.data.userId;
      const hasText = !!data?.content && data.content.trim().length > 0;
      const hasAttachments = Array.isArray(data?.attachments) && data.attachments.length > 0;
      if (!userId || !data?.id || !data?.toUserId || (!hasText && !hasAttachments)) {
        const err = { message: 'Invalid message payload' };
        console.error('❌ Invalid payload:', { userId, data });
        if (ack) return ack(err);
        return socket.emit('error', err);
      }

      const now = new Date().toISOString();
      const { data: message, error } = await supabaseAdmin
        .from('messages')
        .insert({
          id: data.id,
          sender_id: userId,
          receiver_id: data.toUserId,
          content: data.content || '',
          attachments: data.attachments || [],
          reply_to_id: data.replyTo?.id ?? null,
          created_at: now,
          is_read: false,
          reactions: [],
        })
        .select('*')
        .single();

      if (error) {
        console.error('❌ DB insert error:', error);
        throw error;
      }

      const payload = {
        id: message.id,
        messageId: message.id,
        senderId: message.sender_id,
        receiverId: message.receiver_id,
        fromUserId: message.sender_id,
        toUserId: message.receiver_id,
        content: message.content,
        attachments: message.attachments || [],
        isRead: message.is_read,
        createdAt: message.created_at,
        replyTo: data.replyTo ? {
          id: data.replyTo.id,
          content: data.replyTo.content,
          senderId: data.replyTo.senderId,
        } : null,
        reactions: message.reactions || [],
      };

      // Check if recipient is connected
      const recipientRoom = `user:${data.toUserId}`;
      const recipientSockets = await io.in(recipientRoom).allSockets();
      console.log('📡 Recipient sockets in room:', recipientRoom, recipientSockets.size);

      // Broadcast to recipient
      io.to(recipientRoom).emit('message:received', payload);
      console.log('📤 Emitted message:received to:', recipientRoom);
      
      // Echo back to sender
      socket.emit('message:sent', payload);
      console.log('📤 Emitted message:sent to sender');

      if (typeof ack === 'function') {
        ack(null, payload);
        console.log('✅ Ack sent to sender');
      }
    } catch (err: any) {
      console.error('❌ message:create error:', err);
      if (typeof ack === 'function') return ack({ message: err?.message || 'Failed to create message' });
      socket.emit('error', { message: 'Failed to create message' });
    }
  });

  // Toggle reaction on a message
  socket.on('message:react', async (data: { messageId: string; emoji: string }, ack?: (err: any, response?: any) => void) => {
    try {
      const userId = socket.data.userId as string;
      if (!userId || !data?.messageId || !data?.emoji) {
        const err = { message: 'Invalid reaction payload' };
        if (ack) return ack(err);
        return socket.emit('error', err);
      }

      // Fetch current reactions
      const { data: row, error: fetchErr } = await supabaseAdmin
        .from('messages')
        .select('id, reactions, sender_id, receiver_id')
        .eq('id', data.messageId)
        .single();
      if (fetchErr || !row) throw fetchErr;

      const prev: Array<{ userId: string; emoji: string }> = Array.isArray(row.reactions) ? row.reactions : [];
      const existingIdx = prev.findIndex((r) => r.userId === userId && r.emoji === data.emoji);
      let next: Array<{ userId: string; emoji: string }>;
      if (existingIdx >= 0) {
        next = [...prev.slice(0, existingIdx), ...prev.slice(existingIdx + 1)];
      } else {
        next = [...prev, { userId, emoji: data.emoji }];
      }

      const { error: updateErr } = await supabaseAdmin
        .from('messages')
        .update({ reactions: next })
        .eq('id', data.messageId);
      if (updateErr) throw updateErr;

      const payload = {
        messageId: data.messageId,
        reactions: next,
      };

      // Notify both users in the conversation
      const roomA = `user:${row.sender_id}`;
      const roomB = `user:${row.receiver_id}`;
      io.to(roomA).emit('message:reaction', payload);
      io.to(roomB).emit('message:reaction', payload);
      if (ack) return ack(null, payload);
    } catch (err: any) {
      if (typeof ack === 'function') return ack({ message: err?.message || 'Failed to react' });
      socket.emit('error', { message: 'Failed to react to message' });
    }
  });

  socket.on('message:read', async (data: { fromUserId: string }) => {
    console.log('📥 message:read received:', { reader: socket.data.userId, from: data.fromUserId });
    
    try {
      if (!data?.fromUserId) return;
      const me = socket.data.userId;
      const now = new Date().toISOString();

      const { data: updated, error } = await supabaseAdmin
        .from('messages')
        .update({ is_read: true, read_at: now })
        .eq('sender_id', data.fromUserId)
        .eq('receiver_id', me)
        .eq('is_read', false)
        .select('id');

      if (error) throw error;

      const messageIds = (updated || []).map((m: any) => m.id);
      console.log('✅ Marked as read:', messageIds.length, 'messages');

      const senderRoom = `user:${data.fromUserId}`;
      io.to(senderRoom).emit('message:read:ack', {
        byUserId: me,
        at: now,
        messageIds,
      });
      console.log('📤 Emitted message:read:ack to:', senderRoom);
    } catch (err) {
      console.error('❌ message:read error:', err);
      socket.emit('error', { message: 'Failed to relay read receipt' });
    }
  });
}