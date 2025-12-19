"use client";
import Shell from "@/components/layout/Shell";
import { Header, Content } from "@/features/marketplace/views/shared";
import CardSkeleton from "@/components/ui/card.skeleton";
import { SORT_OPTIONS } from "@/features/marketplace/constants";
import { TaskCard } from "@/entities/task/components/TaskCard";
import { trpc } from "@/lib/trpc";
import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function MarketplaceTasksPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [sortBy, setSortBy] = useState<"relevance" | "latest">("latest");
  const [query, setQuery] = useState("");

  const { data, isLoading, isFetching } = trpc.task.list.useQuery({
    page,
    pageSize,
    scope: "all",
    visibility: "PUBLIC",
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
            title="Tasks"
            description="Discover public tasks and collaboration opportunities"
            searchValue={query}
            onSearchChange={setQuery}
            onSearchSubmit={handleSearchSubmit}
            navigateTo={"/marketplace/tasks/search/results"}
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
                    <TaskCard
                      key={item.id}
                      item={item}
                      onOpen={(id) => router.push(`/dashboard/tasks/${id}`)}
                      onConvert={() => {}}
                    />
                  ))}
            </div>
          </Content>
        </div>
      </div>
    </Shell>
  );
}

