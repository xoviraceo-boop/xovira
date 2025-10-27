'use client';

import { useState } from 'react';
import { useComments } from '../hooks/useComments';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';
import { Loader2 } from 'lucide-react';

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { comments, isLoading, createComment } = useComments(postId);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const topLevelComments = comments.filter((c) => !c.parentId);

  return (
    <div className="space-y-4">
      {/* Comment Form */}
      <CommentForm
        postId={postId}
        onSubmit={(content) => {
          createComment.mutate({
            postId,
            content,
          });
        }}
        placeholder="Write a comment..."
      />

      {/* Comments List */}
      <div className="space-y-4">
        {topLevelComments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            replies={comments.filter((c) => c.parentId === comment.id)}
            onReply={(commentId) => setReplyingTo(commentId)}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
          />
        ))}
      </div>

      {comments.length === 0 && (
        <p className="text-center text-muted-foreground py-4">
          No comments yet. Be the first to comment!
        </p>
      )}
    </div>
  );
}