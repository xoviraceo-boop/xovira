"use client";
import Shell from "@/components/layout/Shell";
import { Header, Content } from "@/features/marketplace/views/shared";
import { X } from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CardSkeleton from "@/components/ui/card.skeleton";
import { SORT_OPTIONS } from "@/features/marketplace/constants";
import { ToolFilterSidebar } from "@/entities/tool/components/ToolFilterSidebar";
import { ToolCard } from "@/entities/tool/components/ToolCard";
import { trpc } from "@/lib/trpc";

export default function ToolSearchResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [filters, setFilters] = useState<{ category?: string; isPublic?: boolean }>({ isPublic: true });
  const [sortBy, setSortBy] = useState<"relevance" | "latest">("latest");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isFetching } = trpc.tool.list.useQuery({
    page,
    pageSize,
    scope: "all",
    isPublic: filters.isPublic,
    category: filters.category,
    query,
  } as any, { staleTime: 30_000 });

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || undefined;
    const isPublicParam = searchParams.get("isPublic");
    const sort = (searchParams.get("sort") as any) || "latest";
    const p = Number(searchParams.get("page") || 1);

    setQuery(q);
    setFilters({ category, isPublic: isPublicParam != null ? isPublicParam === "true" : true });
    setSortBy(sort);
    setPage(Number.isFinite(p) && p > 0 ? p : 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (filters.category) params.set("category", filters.category);
    if (typeof filters.isPublic === "boolean") params.set("isPublic", String(filters.isPublic));
    if (sortBy) params.set("sort", sortBy);
    if (page !== 1) params.set("page", String(page));
    const url = `/marketplace/tools/search/results${params.toString() ? `?${params.toString()}` : ""}`;
    router.replace(url, { scroll: false });
  }, [query, filters, sortBy, page, router]);

  useEffect(() => {
    setPage(1);
  }, [query, filters.category, filters.isPublic, sortBy]);

  const filterChips = React.useMemo(() => {
    const chips: Array<{ id: string; label: string; onRemove: () => void }> = [];
    if (query) chips.push({ id: "query", label: `q: ${query}`, onRemove: () => setQuery("") });
    if (filters.category) chips.push({ id: "category", label: filters.category, onRemove: () => setFilters((f) => ({ ...f, category: undefined })) });
    if (typeof filters.isPublic === "boolean") chips.push({ id: "visibility", label: filters.isPublic ? "Public" : "Private", onRemove: () => setFilters((f) => ({ ...f, isPublic: undefined })) });
    return chips;
  }, [query, filters]);

  const handleClearAll = useCallback(() => {
    setQuery("");
    setFilters({ category: undefined, isPublic: true });
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
              title="Tools"
              description="Discover public tools shared by the community"
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

        <div className="order-1 lg:order-2 hidden lg:block">
          <ToolFilterSidebar
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
              <ToolFilterSidebar
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

