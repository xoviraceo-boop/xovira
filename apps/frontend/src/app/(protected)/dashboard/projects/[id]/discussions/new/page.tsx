"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { AtSign, Hash, ImageIcon, Smile } from "lucide-react";

export default function NewDiscussionPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.postId as string;
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const utils = trpc.useUtils?.() as any;
  const createMutation = (trpc as any).discussions.create.useMutation({
    onSuccess: async (res: { id: string }) => {
      try {
        await utils?.discussions?.list.invalidate({ projectId, page: 1, pageSize: 20 });
      } catch {}
      router.push(`/dashboard/projects/${projectId}/discussions/${res.id}`);
    },
  });

  const canSubmit = title.trim().length > 0;

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow border border-slate-200 max-w-3xl">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-800">New Discussion</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Hash className="h-4 w-4 mr-1" /> Hashtag</Button>
            <Button variant="outline" size="sm"><AtSign className="h-4 w-4 mr-1" /> Mention</Button>
            <Button variant="outline" size="sm"><ImageIcon className="h-4 w-4 mr-1" /> Media</Button>
            <Button variant="outline" size="sm"><Smile className="h-4 w-4 mr-1" /> Emoji</Button>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
          />
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share details, add #tags, and @mention teammates"
            className="min-h-[180px]"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
            <Button
              onClick={() => createMutation.mutate({ projectId, title, body })}
              disabled={!canSubmit || createMutation.isLoading}
            >
              {createMutation.isLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


