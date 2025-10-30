"use client";

import { notFound } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { CommentSection } from "@/entities/comments/components/CommentSection";

export default function DiscussionPage({
  params,
}: {
  params: { id: string; postId: string };
}) {
  const projectId = params.id;
  const discussionId = params.postId;

  const {
    data: discussion,
    isLoading,
    isError,
  } = trpc.discussions.get.useQuery(
    { projectId, id: discussionId },
    { enabled: !!projectId && !!discussionId }
  );

  if (isLoading) {
    return <div>Loading discussion...</div>;
  }

  if (isError || !discussion) {
    return notFound();
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h1 className="text-2xl font-semibold text-slate-800">Discussion</h1>
        </div>
        <div className="p-4">
          <CommentSection postId={discussionId} />
        </div>
      </div>
    </div>
  );
}
