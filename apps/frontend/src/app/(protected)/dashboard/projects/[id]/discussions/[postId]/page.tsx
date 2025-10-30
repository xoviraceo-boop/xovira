import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { useSession } from "next-auth/react";
import { CommentSection } from "@/entities/comments/components/CommentSection";

export default async function DiscussionPage({ params }: { params: { postId: string } }) {
  const { data: session } = useSession();
  const discussionId = params.postId; 

  const post = await prisma.post.findUnique({ where: { id: discussionId }, select: { id: true, projectId: true } });
  if (!post?.projectId) notFound();

  const userId = session.user.id;
  const canView = await prisma.project.findFirst({
    where: {
      id: post.projectId,
      OR: [
        { ownerId: userId },
        { members: { some: { userId, isBlocked: false, canViewProject: true } } },
        { teams: { some: { team: { members: { some: { userId } } } } } },
      ],
    },
    select: { id: true },
  });
  if (!canView) notFound();

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


