'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowBigUp, ArrowBigDown, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useComments } from '../hooks/useComments';
import { CommentForm } from './CommentForm';
import type { Comment } from '@/entities/shared/types';
import { cn } from '@/lib/utils';

interface CommentItemProps {
  comment: Comment;
  replies: Comment[];
  onReply: (commentId: string) => void;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  depth?: number;
}

export function CommentItem({
  comment,
  replies,
  onReply,
  replyingTo,
  setReplyingTo,
  depth = 0,
}: CommentItemProps) {
  const { voteComment, createComment } = useComments(comment.postId);
  const [userVote, setUserVote] = useState<'UPVOTE' | 'DOWNVOTE' | null>(null);
  const [showReplies, setShowReplies] = useState(true);

  const handleVote = async (voteType: 'UPVOTE' | 'DOWNVOTE') => {
    try {
      // Toggle vote off if clicking same vote
      if (userVote === voteType) {
        setUserVote(null);
        // You might want to handle removing vote on backend
      } else {
        await voteComment.mutateAsync({
          commentId: comment.id,
          voteType,
        });
        setUserVote(voteType);
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleReplySubmit = (content: string) => {
    createComment.mutate({
      postId: comment.postId,
      content,
      parentId: comment.id,
    });
    setReplyingTo(null);
  };

  const isReplyingToThis = replyingTo === comment.id;
  const maxDepth = 5; // Maximum nesting level

  return (
    <div className={cn('flex gap-3', depth > 0 && 'ml-8')}>
      {/* Avatar */}
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.user.avatar} />
        <AvatarFallback>{comment.user.name?.[0]}</AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2">
        {/* Comment Header */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{comment.user.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
          {comment.isEdited && (
            <span className="text-xs text-muted-foreground">(edited)</span>
          )}
        </div>

        {/* Comment Content */}
        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>

        {/* Comment Actions */}
        <div className="flex items-center gap-4">
          {/* Upvote */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-7 px-2',
              userVote === 'UPVOTE' && 'text-orange-500'
            )}
            onClick={() => handleVote('UPVOTE')}
          >
            <ArrowBigUp
              className={cn(
                'h-4 w-4 mr-1',
                userVote === 'UPVOTE' && 'fill-current'
              )}
            />
            {comment.upvotes}
          </Button>

          {/* Downvote */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-7 px-2',
              userVote === 'DOWNVOTE' && 'text-blue-500'
            )}
            onClick={() => handleVote('DOWNVOTE')}
          >
            <ArrowBigDown
              className={cn(
                'h-4 w-4 mr-1',
                userVote === 'DOWNVOTE' && 'fill-current'
              )}
            />
            {comment.downvotes}
          </Button>

          {/* Reply Button */}
          {depth < maxDepth && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => onReply(comment.id)}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Reply
            </Button>
          )}

          {/* Show/Hide Replies */}
          {replies.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setShowReplies(!showReplies)}
            >
              {showReplies ? 'Hide' : 'Show'} {replies.length}{' '}
              {replies.length === 1 ? 'reply' : 'replies'}
            </Button>
          )}
        </div>

        {/* Reply Form */}
        {isReplyingToThis && (
          <div className="mt-2">
            <CommentForm
              postId={comment.postId}
              onSubmit={handleReplySubmit}
              onCancel={() => setReplyingTo(null)}
              placeholder={`Reply to ${comment.user.name}...`}
              autoFocus
            />
          </div>
        )}

        {/* Nested Replies */}
        {showReplies && replies.length > 0 && (
          <div className="space-y-4 mt-4">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                replies={[]}
                onReply={onReply}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}