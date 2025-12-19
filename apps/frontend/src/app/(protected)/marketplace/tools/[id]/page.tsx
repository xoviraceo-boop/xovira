"use client";
import Shell from "@/components/layout/Shell";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { ToolView } from "@/features/dashboard/views/tool/ToolView";

export default function ToolDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const { data: tool, isLoading, error } = trpc.tool.get.useQuery({ id }, { enabled: !!id });

  useEffect(() => {
    if (!isLoading && !tool && !error) {
      router.push('/marketplace/tools');
    }
  }, [tool, isLoading, error, router]);

  if (isLoading) {
    return (
      <Shell>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading Tool...</p>
        </div>
      </Shell>
    );
  }

  if (!tool) {
    return null;
  }

  return (
    <Shell>
      <ToolView tool={tool as any} />
    </Shell>
  );
}

