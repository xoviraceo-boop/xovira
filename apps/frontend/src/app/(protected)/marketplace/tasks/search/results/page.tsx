"use client";
import Shell from "@/components/layout/Shell";
import { Header, Content } from "@/features/marketplace/views/shared";
import { X } from "lucide-react";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CardSkeleton from "@/components/ui/card.skeleton";
import { SORT_OPTIONS } from "@/features/marketplace/constants";
import { TaskFilterSidebar } from "@/entities/task/components/TaskFilterSidebar";
import { TaskCard } from "@/entities/task/components/TaskCard";
import { trpc } from "@/lib/trpc";

export default function TaskSearchResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [filters, setFilters] = useState<{ statuses: string[]; visibility?: string }>({ statuses: [], visibility: "PUBLIC" });
  const [sortBy, setSortBy] = useState<"relevance" | "latest">("latest");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isFetching } = trpc.task.list.useQuery({
    page,
    pageSize,
    scope: "all",
    visibility: filters.visibility as any,
    status: filters.statuses,
    query,
  } as any, { staleTime: 30_000 });

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const visibility = searchParams.get("visibility") || "PUBLIC";
    const statuses = (searchParams.get("status") || "").split(",").filter(Boolean);
    const sort = (searchParams.get("sort") as any) || "latest";
    const p = Number(searchParams.get("page") || 1);

    setQuery(q);
    setFilters({ statuses, visibility });
    setSortBy(sort);
    setPage(Number.isFinite(p) && p > 0 ? p : 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (filters.visibility) params.set("visibility", filters.visibility);
    if (filters.statuses?.length) params.set("status", filters.statuses.join(","));
    if (sortBy) params.set("sort", sortBy);
    if (page !== 1) params.set("page", String(page));
    const url = `/marketplace/tasks/search/results${params.toString() ? `?${params.toString()}` : ""}`;
    router.replace(url, { scroll: false });
  }, [query, filters, sortBy, page, router]);

  useEffect(() => {
    setPage(1);
  }, [query, filters.visibility, filters.statuses, sortBy]);

  const filterChips = useMemo(() => {
    const chips: Array<{ id: string; label: string; onRemove: () => void }> = [];
    if (query) chips.push({ id: "query", label: `q: ${query}`, onRemove: () => setQuery("") });
    if (filters.visibility) chips.push({ id: "visibility", label: filters.visibility, onRemove: () => setFilters((f) => ({ ...f, visibility: undefined })) });
    if (filters.statuses?.length) chips.push({ id: "status", label: filters.statuses.join(","), onRemove: () => setFilters((f) => ({ ...f, statuses: [] })) });
    return chips;
  }, [query, filters]);

  const handleClearAll = useCallback(() => {
    setQuery("");
    setFilters({ statuses: [], visibility: "PUBLIC" });
  }, []);

  const toggleFilters = useCallback((open: boolean) => {
    setShowFilters(open);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(open ? "filters:mobile:open" : "filters:mobile:close"));
    }
  }, []);

  return (
    <Shell>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_var(--filter-sidebar-width,_18rem)] gap-0">
        <div className="order-2 lg:order-1 flex-1 lg:pr-4">
          <div className="space-y-4">
            <Header
              title="Tasks"
              description="Discover public tasks and collaboration opportunities"
              searchValue={query}
              onSearchChange={setQuery}
              onSearchSubmit={() => setPage(1)}
              showFilterButton
              onFilterClick={() => toggleFilters(true)}
            />

            <Content
              resultCount={data?.total ?? 0}
              sortBy={sortBy}
              sortOptions={SORT_OPTIONS}
              onSortChange={(value) => setSortBy(value as any)}
              filterChips={filterChips}
              onClearAllFilters={handleClearAll}
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
                  : (data?.items || []).map((item: any) => (
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

        <div className="order-1 lg:order-2 hidden lg:block">
          <TaskFilterSidebar
            scope={"all" as any}
            onScopeChange={() => {}}
            values={filters}
            onChange={setFilters}
          />
        </div>

        {showFilters && (
          <>
            <div className="fixed inset-0 z-[60] bg-black/30 lg:hidden" onClick={() => toggleFilters(false)} />
            <div className="fixed inset-y-0 right-0 z-[60] w-auto min-w-[16rem] bg-background shadow-xl lg:hidden">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <span className="font-medium">Filters</span>
                <button className="rounded-md border p-1.5 hover:bg-muted" onClick={() => toggleFilters(false)} aria-label="Close filters">
                  <X size={18} />
                </button>
              </div>
              <TaskFilterSidebar
                isOverlay
                scope={"all" as any}
                onScopeChange={() => {}}
                values={filters}
                onChange={setFilters}
              />
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}

