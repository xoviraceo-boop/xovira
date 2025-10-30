'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { usePosts } from '../hooks/usePosts';
import { CommentSection } from '../../comments/components/CommentSection';
import { formatDistanceToNow } from 'date-fns';
import type { Post } from '@xovira/database/src/generated/prisma/client';

interface PostCardProps {
  post: Post;
  feedType: 'global' | 'user' | 'project';
  feedId?: string;
}

export function PostCard({ post, feedType, feedId }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const { likePost, unlikePost } = usePosts(feedType, feedId);
  const [isLiked, setIsLiked] = useState(false); // TODO: Get from user's likes

  const handleLike = async () => {
    try {
      if (isLiked) {
        await unlikePost.mutateAsync(post.id);
        setIsLiked(false);
      } else {
        await likePost.mutateAsync(post.id);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <Avatar>
          <AvatarImage src={''} />
          <AvatarFallback>?</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">User</h3>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 pt-4 border-t">
        <Button
          variant="ghost"
          onClick={handleLike}
          className={isLiked ? 'text-red-500 text-sm p-2' : 'text-sm p-2'}
        >
          <Heart className={`mr-2 h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          {post.likeCount}
        </Button>

        <Button
          variant="ghost"
          onClick={() => setShowComments(!showComments)}
          className="text-sm p-2"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          {post.commentCount}
        </Button>

        <Button variant="ghost" className="text-sm p-2">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t">
          <CommentSection postId={post.id} />
        </div>
      )}
    </Card>
  );
}