"use client";
import Shell from "@/components/layout/Shell";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { MaterialPublicView } from "@/features/marketplace/views/material/MaterialPublicView";

export default function MaterialDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: material, isLoading, error } = trpc.material.get.useQuery({ id }, { enabled: !!id });
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !material && !error) {
      router.push('/marketplace/materials');
    }
  }, [material, isLoading, error, router]);

  if (isLoading) {
    return (
      <Shell>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading Material...</p>
        </div>
      </Shell>
    );
  }

  if (!material) {
    return null; 
  }
  return (
    <Shell>
      <MaterialPublicView material={material} />
    </Shell>
  );
}
