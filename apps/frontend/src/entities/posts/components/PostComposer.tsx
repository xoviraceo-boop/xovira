'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { usePosts } from '../hooks/usePosts';
import { Loader2 } from 'lucide-react';

interface PostComposerProps {
  feedType: 'global' | 'user' | 'project';
  feedId?: string;
  projectId?: string;
  placeholder?: string;
}

export function PostComposer({
  feedType,
  feedId,
  projectId,
  placeholder = "What's on your mind?",
}: PostComposerProps) {
  const [content, setContent] = useState('');
  const { createPost } = usePosts(feedType, feedId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await createPost.mutateAsync({
        content: content.trim(),
        type: 'UPDATE',
        visibility: 'PUBLIC',
        projectId,
      });

      setContent('');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="min-h-[100px] resize-none"
          maxLength={5000}
        />

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {content.length}/5000
          </span>

          <Button
            type="submit"
            disabled={!content.trim() || createPost.isPending}
          >
            {createPost.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Post
          </Button>
        </div>
      </form>
    </Card>
  );
}