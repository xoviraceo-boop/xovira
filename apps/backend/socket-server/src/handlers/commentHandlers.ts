import { Socket } from 'socket.io';
import { supabaseAdmin } from '@/lib/supabase';
import type {
  CreateCommentData,
  UpdateCommentData,
  DeleteCommentData,
  VoteCommentData,
} from '@/types';

export function registerCommentHandlers(io: any, socket: Socket) {
  socket.on('comment:create', async (data: CreateCommentData) => {
    try {
      const userId = socket.data.userId;

      const { data: comment, error } = await supabaseAdmin
        .from('post_comments')
        .insert({
          post_id: data.postId,
          user_id: userId,
          parent_id: data.parentId,
          content: data.content,
        })
        .select(`
          *,
          user:users!post_comments_user_id_fkey(id, name, avatar)
        `)
        .single();

      if (error) throw error;

      // Increment comment count on post
      await supabaseAdmin
        .from('posts')
        .update({
          comment_count: supabaseAdmin.rpc('increment', { x: 1 }),
        })
        .eq('id', data.postId);

      // Broadcast to post room
      io.to(`post:${data.postId}`).emit('comment:created', { comment });

    } catch (error) {
      console.error('Error creating comment:', error);
      socket.emit('error', { message: 'Failed to create comment' });
    }
  });

  socket.on('comment:update', async (data: UpdateCommentData) => {
    try {
      const userId = socket.data.userId;
      const now = new Date().toISOString();

      const { data: comment, error } = await supabaseAdmin
        .from('post_comments')
        .update({
          content: data.content,
          is_edited: true,
          edited_at: now,
        })
        .eq('id', data.commentId)
        .eq('user_id', userId)
        .select('post_id')
        .single();

      if (error) throw error;

      // Broadcast update
      io.to(`post:${comment.post_id}`).emit('comment:updated', {
        commentId: data.commentId,
        content: data.content,
        isEdited: true,
        editedAt: now,
      });

    } catch (error) {
      console.error('Error updating comment:', error);
      socket.emit('error', { message: 'Failed to update comment' });
    }
  });

  socket.on('comment:delete', async (data: DeleteCommentData) => {
    try {
      const userId = socket.data.userId;

      const { data: comment, error: selectError } = await supabaseAdmin
        .from('post_comments')
        .select('post_id')
        .eq('id', data.commentId)
        .eq('user_id', userId)
        .single();

      if (selectError) throw selectError;

      const { error } = await supabaseAdmin
        .from('post_comments')
        .delete()
        .eq('id', data.commentId)
        .eq('user_id', userId);

      if (error) throw error;

      // Decrement comment count
      await supabaseAdmin
        .from('posts')
        .update({
          comment_count: supabaseAdmin.rpc('decrement', { x: 1 }),
        })
        .eq('id', comment.post_id);

      // Broadcast deletion
      io.to(`post:${comment.post_id}`).emit('comment:deleted', {
        commentId: data.commentId,
        postId: comment.post_id,
      });

    } catch (error) {
      console.error('Error deleting comment:', error);
      socket.emit('error', { message: 'Failed to delete comment' });
    }
  });

  socket.on('comment:vote', async (data: VoteCommentData) => {
    try {
      const userId = socket.data.userId;

      // Upsert vote
      const { error: voteError } = await supabaseAdmin
        .from('post_comment_votes')
        .upsert({
          comment_id: data.commentId,
          user_id: userId,
          vote_type: data.voteType,
        }, {
          onConflict: 'comment_id,user_id'
        });

      if (voteError) throw voteError;

      // Recalculate vote counts
      const { data: votes, error: countError } = await supabaseAdmin
        .from('post_comment_votes')
        .select('vote_type')
        .eq('comment_id', data.commentId);

      if (countError) throw countError;

      const upvotes = (votes || []).filter((v: any) => v.vote_type === 'UPVOTE').length;
      const downvotes = (votes || []).filter((v: any) => v.vote_type === 'DOWNVOTE').length;

      // Update comment
      const { data: comment, error: updateError } = await supabaseAdmin
        .from('post_comments')
        .update({ upvotes, downvotes })
        .eq('id', data.commentId)
        .select('post_id')
        .single();

      if (updateError) throw updateError;

      // Broadcast vote update
      io.to(`post:${comment.post_id}`).emit('comment:voted', {
        commentId: data.commentId,
        userId,
        voteType: data.voteType,
        upvotes,
        downvotes,
      });

    } catch (error) {
      console.error('Error voting on comment:', error);
      socket.emit('error', { message: 'Failed to vote on comment' });
    }
  });
}