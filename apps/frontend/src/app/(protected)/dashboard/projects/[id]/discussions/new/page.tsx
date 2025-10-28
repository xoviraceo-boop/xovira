"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { CommentForm } from "@/entities/comments/components/CommentForm";

export default function NewDiscussionPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.postId as string;
  const [title, setTitle] = useState("");

  const utils = trpc.useUtils?.() as any;
  
  // Fetch available users for mentions
  const { data: projectUsers } = (trpc as any).projects?.getMembers?.useQuery?.(
    { projectId },
    { enabled: !!projectId }
  ) || { data: [] };

  const createMutation = (trpc as any).discussions.create.useMutation({
    onSuccess: async (res: { id: string }) => {
      try {
        await utils?.discussions?.list.invalidate({ projectId, page: 1, pageSize: 20 });
      } catch {}
      router.push(`/dashboard/projects/${projectId}/discussions/${res.id}`);
    },
  });

  const handleSubmit = (body: string, attachments?: string[]) => {
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    createMutation.mutate({ 
      projectId, 
      title: title.trim(), 
      body,
      attachments 
    });
  };

  const canSubmit = title.trim().length > 0;

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow border border-slate-200 max-w-3xl mx-auto">
        <div className="p-4 border-b border-slate-200">
          <h1 className="text-xl font-semibold text-slate-800">New Discussion</h1>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter discussion title"
              className="text-base"
              maxLength={200}
            />
            <p className="text-xs text-slate-500 mt-1">
              {title.length}/200 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <CommentForm
              postId={projectId}
              onSubmit={handleSubmit}
              onCancel={() => router.back()}
              placeholder="Share details, add #tags, and @mention teammates..."
              availableTags={[
                'bug',
                'feature',
                'documentation',
                'question',
                'urgent',
                'improvement',
                'design',
                'performance',
                'security',
                'testing',
              ]}
              availableUsers={projectUsers || []}
            />
          </div>
        </div>
      </div>
    </div>
  );
}