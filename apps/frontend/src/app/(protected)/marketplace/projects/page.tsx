"use client";
import Shell from "@/components/layout/Shell";
import { MarketplaceHeader, MarketplaceContent } from "@/features/marketplace/views";
import PublicProjectCard from "@/entities/projects/components/PublicProjectCard";
import CardSkeleton from "@/components/ui/card.skeleton";
import { usePrefetchedProjects } from "@/features/marketplace/hooks/usePrefetchedProjects";
import React, { useState, useCallback } from "react";
import { SORT_OPTIONS } from "@/features/marketplace/constants";

export default function MarketplacePage() {
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [sortBy, setSortBy] = useState<"relevance" | "latest">("latest");
  const [query, setQuery] = useState("");

  const { data, isLoading, isFetching } = usePrefetchedProjects({
    page,
    pageSize,
    sortBy,
    query,
  });

  const handleSearchSubmit = useCallback(() => {
    setPage(1);
  }, []);

  return (
    <Shell>
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-4">
          <MarketplaceHeader
            searchValue={query}
            onSearchChange={setQuery}
            onSearchSubmit={handleSearchSubmit}
            navigateTo={"/marketplace/projects/search/results"}
          />

          <MarketplaceContent
            resultCount={data?.total ?? 0}
            sortBy={sortBy}
            sortOptions={SORT_OPTIONS}
            onSortChange={(value) => setSortBy(value as any)}
            isLoading={isLoading || isFetching}
            isEmpty={(data?.items?.length ?? 0) === 0}
            currentPage={page}
            hasNextPage={(data?.items?.length || 0) >= pageSize}
            hasPreviousPage={page > 1}
            onPageChange={setPage}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {isLoading
                ? Array.from({ length: 9 }).map((_, i) => <CardSkeleton key={i} />)
                : (data?.items ?? []).map((project) => (
                    <PublicProjectCard 
                      key={project.id} 
                      project={project} 
                    />
                  ))}
            </div>
          </MarketplaceContent>
        </div>
      </div>
    </Shell>
  );
}