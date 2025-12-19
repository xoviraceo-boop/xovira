"use client";
import Shell from "@/components/layout/Shell";
import { trpc } from "@/lib/trpc";
import { useParams, useRouter } from "next/navigation";
import CardSkeleton from "@/components/ui/card.skeleton";
import { ResourceDetail } from "@/entities/resources/components/ResourceDetail";
import type { Resource } from "@/entities/resources/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function MarketplaceResourceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: resource, isLoading } = trpc.resource.get.useQuery({ id: id as string });

  return (
    <Shell>
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      {isLoading || !resource ? (
        <CardSkeleton className="h-[600px]" />
      ) : (
        <ResourceDetail resource={resource as Resource} />
      )}
    </Shell>
  );
}
