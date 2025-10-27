import { Socket } from 'socket.io';
import { supabaseAdmin } from '@/lib/supabase';
import { redis } from '@/lib/redis';
import {
  CreatePostData,
  UpdatePostData,
  DeletePostData,
  LikePostData,
  UnlikePostData,
} from '../types/index.js';

export function registerPostHandlers(io: any, socket: Socket) {
  socket.on('post:create', async (data: CreatePostData, ack?: (err: any, response?: any) => void) => {
    console.log('📝 Received post:create event', { userId: socket.data.userId, hasAck: typeof ack === 'function' });
    
    try {
      const userId = socket.data.userId;
      const { data: post, error } = await supabaseAdmin
        .from('posts')
        .insert({
          user_id: userId,
          content: data.content,
          type: data.type,
          visibility: data.visibility,
          project_id: data.projectId,
          team_id: data.teamId,
          proposal_id: data.proposalId,
          attachments: data.attachments || [],
        })
        .select(`
          *,
          user:users!posts_user_id_fkey(id, name, avatar)
        `)
        .single();
  
      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }
  
      console.log('✅ Post created successfully:', post.id);
  
      // ... rest of the code ...
  
      if (typeof ack === 'function') {
        console.log('📤 Sending acknowledgement');
        ack(null, { post });
      }
  
    } catch (error) {
      console.error('❌ Error creating post:', error);
      if (typeof ack === 'function') {
        ack(error instanceof Error ? { message: error.message } : { message: 'Failed to create post' });
      } else {
        socket.emit('error', { message: 'Failed to create post' });
      }
    }
  });

  socket.on('post:update', async (data: UpdatePostData) => {
    try {
      const userId = socket.data.userId;
      const now = new Date().toISOString();

      const { data: post, error } = await supabaseAdmin
        .from('posts')
        .update({
          content: data.content,
          is_edited: true,
          edited_at: now,
        })
        .eq('id', data.postId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      // Broadcast update
      io.to(`post:${data.postId}`).emit('post:updated', {
        postId: data.postId,
        content: data.content,
        isEdited: true,
        editedAt: now,
      });

      // Update cache
      await redis.setex(`post:${post.id}`, 3600, JSON.stringify(post));

    } catch (error) {
      console.error('Error updating post:', error);
      socket.emit('error', { message: 'Failed to update post' });
    }
  });

  socket.on('post:delete', async (data: DeletePostData) => {
    try {
      const userId = socket.data.userId;

      const { error } = await supabaseAdmin
        .from('posts')
        .delete()
        .eq('id', data.postId)
        .eq('user_id', userId);

      if (error) throw error;

      // Broadcast deletion
      io.to(`post:${data.postId}`).emit('post:deleted', {
        postId: data.postId,
      });

      // Remove from cache
      await redis.del(`post:${data.postId}`);

    } catch (error) {
      console.error('Error deleting post:', error);
      socket.emit('error', { message: 'Failed to delete post' });
    }
  });

  socket.on('post:like', async (data: LikePostData) => {
    try {
      const userId = socket.data.userId;
  
      // Insert like
      const { error: likeError } = await supabaseAdmin
        .from('post_likes')
        .insert({
          post_id: data.postId,
          user_id: userId,
        });
  
      if (likeError && likeError.code !== '23505') throw likeError;
  
      // ✅ FIX: Use raw SQL or fetch-then-update approach
      const { data: post, error } = await supabaseAdmin
        .from('posts')
        .select('like_count')
        .eq('id', data.postId)
        .single();
  
      if (error) throw error;
  
      const newLikeCount = (post.like_count || 0) + 1;
  
      const { error: updateError } = await supabaseAdmin
        .from('posts')
        .update({ like_count: newLikeCount })
        .eq('id', data.postId);
  
      if (updateError) throw updateError;
  
      // Broadcast like
      io.to(`post:${data.postId}`).emit('post:liked', {
        postId: data.postId,
        userId,
        likeCount: newLikeCount,
      });
  
    } catch (error) {
      console.error('Error liking post:', error);
      socket.emit('error', { message: 'Failed to like post' });
    }
  });

  socket.on('post:unlike', async (data: UnlikePostData) => {
    try {
      const userId = socket.data.userId;
  
      const { error: unlikeError } = await supabaseAdmin
        .from('post_likes')
        .delete()
        .eq('post_id', data.postId)
        .eq('user_id', userId);
  
      if (unlikeError) throw unlikeError;
  
      // ✅ FIX: Fetch current count and update
      const { data: post, error } = await supabaseAdmin
        .from('posts')
        .select('like_count')
        .eq('id', data.postId)
        .single();
  
      if (error) throw error;
  
      const newLikeCount = Math.max((post.like_count || 0) - 1, 0);
  
      const { error: updateError } = await supabaseAdmin
        .from('posts')
        .update({ like_count: newLikeCount })
        .eq('id', data.postId);
  
      if (updateError) throw updateError;
  
      io.to(`post:${data.postId}`).emit('post:unliked', {
        postId: data.postId,
        userId,
        likeCount: newLikeCount,
      });
  
    } catch (error) {
      console.error('Error unliking post:', error);
      socket.emit('error', { message: 'Failed to unlike post' });
    }
  });
}