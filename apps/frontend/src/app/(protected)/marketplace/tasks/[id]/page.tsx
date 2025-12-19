"use client";
import Shell from "@/components/layout/Shell";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { useParams, useRouter } from "next/navigation";
import PublicTaskView from "@/features/marketplace/views/task/PublicTaskView";
import { useEffect } from "react";

export default function MarketplaceTaskDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const { data: task, isLoading, error } = trpc.task.get.useQuery({ id }, { enabled: !!id });

  useEffect(() => {
    if (!isLoading && !task && !error) {
      router.push("/marketplace/tasks");
    }
  }, [task, isLoading, error, router]);

  if (isLoading) {
    return (
      <Shell>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading Task...</p>
        </div>
      </Shell>
    );
  }

  if (!task) {
    return null;
  }

  const updatedAt = task.updatedAt ? new Date(task.updatedAt as any).toLocaleString() : null;

  return (
    <Shell>
      <PublicTaskView task={task} />
    </Shell>
  );
}
