// hooks/usePosts.ts (optimized version)
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';
import { useSocket } from '@/components/providers/SocketProvider';
import { useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/useToast';
import type { Post } from '@xovira/database/src/generated/prisma/client';
import { CreatePostData } from '@xovira/types';

export function usePosts(feedType: 'global' | 'user' | 'project', feedId?: string) {
  const { socket, isConnected, waitForConnection } = useSocket();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const subscribedRef = useRef(false);

  const queryKey = ['posts.list', { feedType, feedId, page: 1, pageSize: 50 }];

  // Fetch posts via tRPC
  const { data: postsResp, isLoading } = trpc.posts.list.useQuery({
    feedType,
    feedId,
    page: 1,
    pageSize: 50,
  }, { 
    enabled: isConnected,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Subscribe to feed
  useEffect(() => {
    if (!socket || !isConnected || subscribedRef.current) return;

    socket.emit('feed:subscribe', { feedType, feedId });
    subscribedRef.current = true;

    return () => {
      if (socket && subscribedRef.current) {
        socket.emit('feed:unsubscribe', { feedType, feedId });
        subscribedRef.current = false;
      }
    };
  }, [socket, isConnected, feedType, feedId]);

  // Memoized update functions
  const handlePostCreated = useCallback((data: any) => {
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return old;
      const items = (old?.items ?? []) as Post[];
      // Prevent duplicates
      if (items.some(p => p.id === data.post.id)) return old;
      return { ...old, items: [data.post, ...items] };
    });

    toast({
      title: 'New Post',
      description: 'A new post has been added',
    });
  }, [queryClient, queryKey, toast]);

  const handlePostUpdated = useCallback((data: any) => {
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return old;
      const items = (old?.items ?? []) as Post[];
      const newItems = items.map((post) => 
        post.id === data.postId 
          ? { ...post, content: data.content, isEdited: data.isEdited } 
          : post
      );
      return { ...old, items: newItems };
    });
  }, [queryClient, queryKey]);

  const handlePostDeleted = useCallback((data: any) => {
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return old;
      const items = (old?.items ?? []) as Post[];
      const newItems = items.filter((post) => post.id !== data.postId);
      return { ...old, items: newItems };
    });
  }, [queryClient, queryKey]);

  const handlePostLiked = useCallback((data: any) => {
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return old;
      const items = (old?.items ?? []) as Post[];
      const newItems = items.map((post) => 
        post.id === data.postId 
          ? { ...post, likeCount: data.likeCount } 
          : post
      );
      return { ...old, items: newItems };
    });
  }, [queryClient, queryKey]);

  // Listen for real-time updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on('post:created', handlePostCreated);
    socket.on('post:updated', handlePostUpdated);
    socket.on('post:deleted', handlePostDeleted);
    socket.on('post:liked', handlePostLiked);
    socket.on('post:unliked', handlePostLiked);

    return () => {
      socket.off('post:created', handlePostCreated);
      socket.off('post:updated', handlePostUpdated);
      socket.off('post:deleted', handlePostDeleted);
      socket.off('post:liked', handlePostLiked);
      socket.off('post:unliked', handlePostLiked);
    };
  }, [socket, isConnected, handlePostCreated, handlePostUpdated, handlePostDeleted, handlePostLiked]);

  const createPost = useMutation({
    mutationFn: async (data: CreatePostData) => {
      const s = await waitForConnection();
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Request timeout'));
        }, 10000);

        s.emit('post:create', data, (err: any, response?: any) => {
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
        title: 'Success',
        description: 'Post created successfully',
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

  const likePost = useMutation({
    mutationFn: async (postId: string) => {
      const s = await waitForConnection();
      s.emit('post:like', { postId });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const unlikePost = useMutation({
    mutationFn: async (postId: string) => {
      const s = await waitForConnection();
      s.emit('post:unlike', { postId });
    },
  });

  return {
    posts: postsResp?.items || [],
    isLoading,
    createPost,
    likePost,
    unlikePost,
  };
}