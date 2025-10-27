'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';
import { useSocket } from '@/components/providers/SocketProvider';
import { useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/useToast';
import type { Comment, CreateCommentData } from '@/entities/shared/types';

export function useComments(postId: string) {
  const { socket, isConnected, waitForConnection } = useSocket();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const subscribedRef = useRef(false);
  const postIdRef = useRef(postId);

  // Update ref when postId changes
  useEffect(() => {
    postIdRef.current = postId;
  }, [postId]);

  const queryKey = ['comments.list', { postId, page: 1, pageSize: 100 }];

  // Fetch comments via tRPC
  const { data: commentsResp, isLoading } = trpc.comments.list.useQuery({
    postId,
    page: 1,
    pageSize: 100,
  }, { 
    enabled: !!postId && isConnected,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Join post room for real-time updates
  useEffect(() => {
    if (!socket || !isConnected || !postId || subscribedRef.current) return;

    socket.emit('feed:subscribe', { 
      feedType: 'project', 
      feedId: postId 
    });
    subscribedRef.current = true;

    return () => {
      if (socket && subscribedRef.current) {
        socket.emit('feed:unsubscribe', { 
          feedType: 'project', 
          feedId: postId 
        });
        subscribedRef.current = false;
      }
    };
  }, [socket, isConnected, postId]);

  // Memoized event handlers
  const handleCommentCreated = useCallback((data: any) => {
    if (data.comment.postId !== postIdRef.current) return;

    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return old;
      const items = (old?.items ?? []) as Comment[];
      
      // Prevent duplicates
      if (items.some(c => c.id === data.comment.id)) return old;
      
      return { ...old, items: [...items, data.comment] };
    });
  }, [queryClient, queryKey]);

  const handleCommentUpdated = useCallback((data: any) => {
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return old;
      const items = (old?.items ?? []) as Comment[];
      const newItems = items.map((comment) => 
        comment.id === data.commentId 
          ? { ...comment, content: data.content, isEdited: data.isEdited } 
          : comment
      );
      return { ...old, items: newItems };
    });
  }, [queryClient, queryKey]);

  const handleCommentDeleted = useCallback((data: any) => {
    if (data.postId !== postIdRef.current) return;

    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return old;
      const items = (old?.items ?? []) as Comment[];
      const newItems = items.filter((comment) => comment.id !== data.commentId);
      return { ...old, items: newItems };
    });
  }, [queryClient, queryKey]);

  const handleCommentVoted = useCallback((data: any) => {
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return old;
      const items = (old?.items ?? []) as Comment[];
      const newItems = items.map((comment) => 
        comment.id === data.commentId 
          ? { ...comment, upvotes: data.upvotes, downvotes: data.downvotes } 
          : comment
      );
      return { ...old, items: newItems };
    });
  }, [queryClient, queryKey]);

  // Listen for real-time comment events
  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on('comment:created', handleCommentCreated);
    socket.on('comment:updated', handleCommentUpdated);
    socket.on('comment:deleted', handleCommentDeleted);
    socket.on('comment:voted', handleCommentVoted);

    return () => {
      socket.off('comment:created', handleCommentCreated);
      socket.off('comment:updated', handleCommentUpdated);
      socket.off('comment:deleted', handleCommentDeleted);
      socket.off('comment:voted', handleCommentVoted);
    };
  }, [socket, isConnected, handleCommentCreated, handleCommentUpdated, handleCommentDeleted, handleCommentVoted]);

  // Mutations
  const createComment = useMutation({
    mutationFn: async (data: CreateCommentData) => {
      const s = await waitForConnection();
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Request timeout'));
        }, 10000);

        s.emit('comment:create', data, (err: any, response?: any) => {
          clearTimeout(timeoutId);
          if (err) {
            const message = typeof err === 'string' ? err : (err?.message || 'Request failed');
            return reject(new Error(message));
          }
          resolve(response);
        });
      });
    },
    onSuccess: () => {
      toast({
        title: 'Comment added',
        description: 'Your comment has been posted',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const voteComment = useMutation({
    mutationFn: async ({ 
      commentId, 
      voteType 
    }: { 
      commentId: string; 
      voteType: 'UPVOTE' | 'DOWNVOTE' 
    }) => {
      const s = await waitForConnection();
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Request timeout'));
        }, 10000);

        s.emit('comment:vote', { commentId, voteType }, (err: any, response?: any) => {
          clearTimeout(timeoutId);
          if (err) {
            const message = typeof err === 'string' ? err : (err?.message || 'Request failed');
            return reject(new Error(message));
          }
          resolve(response);
        });
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    comments: commentsResp?.items || [],
    isLoading,
    createComment,
    voteComment,
  };
}