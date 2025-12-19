"use client";
import Shell from "@/components/layout/Shell";
import { Header, Content } from "@/features/marketplace/views/shared";
import { SORT_OPTIONS } from "@/features/marketplace/constants";
import { ToolCard } from "@/entities/tool/components/ToolCard";
import CardSkeleton from "@/components/ui/card.skeleton";
import { trpc } from "@/lib/trpc";
import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function MarketplaceToolsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [sortBy, setSortBy] = useState<"relevance" | "latest">("latest");
  const [query, setQuery] = useState("");

  const { data, isLoading, isFetching } = trpc.tool.list.useQuery({
    page,
    pageSize,
    scope: "all",
    isPublic: true,
    query,
  } as any, { staleTime: 30_000 });

  const handleSearchSubmit = useCallback(() => {
    setPage(1);
  }, []);

  return (
    <Shell>
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-4">
          <Header
            title="Tools"
            description="Discover public tools shared by the community"
            searchValue={query}
            onSearchChange={setQuery}
            onSearchSubmit={handleSearchSubmit}
            navigateTo={"/marketplace/tools/search/results"}
          />

          <Content
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
                : (data?.items ?? []).map((item: any) => (
                    <ToolCard
                      key={item.id}
                      item={item}
                      onOpen={(id) => router.push(`/dashboard/tools/${id}`)}
                      onManage={(id) => router.push(`/dashboard/tools/${id}`)}
                    />
                  ))}
            </div>
          </Content>
        </div>
      </div>
    </Shell>
  );
}

