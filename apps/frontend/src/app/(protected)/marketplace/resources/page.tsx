"use client";
import Shell from "@/components/layout/Shell";
import { Header, Content } from "@/features/marketplace/views/shared";
import { trpc } from "@/lib/trpc";
import CardSkeleton from "@/components/ui/card.skeleton";
import { useState, useCallback } from "react";
import { ResourceCard } from "@/entities/resources/components/ResourceCard";
import type { Resource } from "@/entities/resources/types";

export default function MarketplaceResourcesPage() {
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [query, setQuery] = useState("");

  const { data, isLoading, isFetching } = trpc.resource.list.useQuery({
    page,
    pageSize,
    scope: "public",
    query,
  });

  const onSearchSubmit = useCallback(() => setPage(1), []);

  return (
    <Shell>
      <Header
        title="Resources"
        description="Discover public resources shared by the community"
        searchValue={query}
        onSearchChange={setQuery}
        onSearchSubmit={onSearchSubmit}
      />

      <Content isLoading={isLoading || isFetching}>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <CardSkeleton key={i} className="h-48" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {(data?.items || []).map((resource) => (
              <ResourceCard key={resource.id} resource={resource as Resource} />
            ))}
          </div>
        )}
      </Content>
    </Shell>
  );
}
