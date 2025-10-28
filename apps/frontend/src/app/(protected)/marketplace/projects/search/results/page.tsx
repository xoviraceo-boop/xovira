"use client";
import Shell from "@/components/layout/Shell";
import { Header, Content } from "@/features/marketplace/views/shared";
import PublicProjectCard from "@/entities/projects/components/PublicProjectCard";
import CardSkeleton from "@/components/ui/card.skeleton";
import ProjectFilterSidebar from "@/features/marketplace/components/ProjectFilterSidebar";
import { X } from "lucide-react";
import { usePrefetchedProjects } from "@/features/marketplace/hooks/usePrefetchedProjects";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SORT_OPTIONS } from '@/features/marketplace/constants';

export default function SearchResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [filters, setFilters] = useState({
    industry: [] as string[],
    location: undefined as string | undefined,
    stage: undefined as any,
  });
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<"relevance" | "latest">("latest");
  const [showFilters, setShowFilters] = useState(false);

  // Optimized data fetching with prefetching
  const { data, isLoading, isFetching } = usePrefetchedProjects({
    page,
    pageSize,
    sortBy,
    query,
    industry: filters.industry,
    stage: filters.stage,
    location: filters.location,
  });

  // Hydrate from URL on mount
  useEffect(() => {
    const q = searchParams.get("q") || "";
    const inds = (searchParams.get("industry") || "").split(",").filter(Boolean);
    const location = searchParams.get("location") || undefined;
    const stage = searchParams.get("stage") || undefined;
    const sort = (searchParams.get("sort") as any) || "latest";
    const p = Number(searchParams.get("page") || 1);

    setQuery(q);
    setFilters({
      industry: inds,
      location,
      stage: stage as any,
    });
    setSortBy(sort);
    setPage(Number.isFinite(p) && p > 0 ? p : 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync to URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (filters.industry.length) params.set("industry", filters.industry.join(","));
    if (filters.location) params.set("location", filters.location);
    if (filters.stage) params.set("stage", String(filters.stage));
    if (sortBy) params.set("sort", sortBy);
    if (page !== 1) params.set("page", String(page));

    const url = `/search/results${params.toString() ? `?${params.toString()}` : ""}`;
    router.replace(url, { scroll: false });
  }, [query, filters, sortBy, page, router]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [query, filters.industry, filters.location, filters.stage, sortBy]);

  // Build filter chips
  const filterChips = React.useMemo(() => {
    const chips = [];

    if (query) {
      chips.push({
        id: "query",
        label: `q: ${query}`,
        onRemove: () => setQuery(""),
      });
    }

    filters.industry.forEach((ind) => {
      chips.push({
        id: `industry-${ind}`,
        label: ind,
        onRemove: () =>
          setFilters((f) => ({ ...f, industries: f.industries.filter((x) => x !== ind) })),
      });
    });

    if (filters.location) {
      chips.push({
        id: "location",
        label: `location: ${filters.location}`,
        onRemove: () => setFilters((f) => ({ ...f, location: undefined })),
      });
    }

    if (filters.stage) {
      chips.push({
        id: "stage",
        label: `stage: ${String(filters.stage)}`,
        onRemove: () => setFilters((f) => ({ ...f, stage: undefined })),
      });
    }

    // removed urgency & funding chips for projects

    return chips;
  }, [query, filters]);

  const handleClearAll = useCallback(() => {
    setQuery("");
    setFilters({
      industry: [],
      location: undefined,
      stage: undefined,
    });
  }, []);

  const handleFilterChange = useCallback((next: any) => {
    setFilters({
      industry: next.industry || [],
      location: next.location,
      stage: next.stage,
    });
  }, []);

  const toggleFilters = useCallback((open: boolean) => {
    setShowFilters(open);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(open ? "filters:mobile:open" : "filters:mobile:close")
      );
    }
  }, []);

  return (
    <Shell>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_var(--filter-sidebar-width,_18rem)] gap-0">
        <div className="order-2 lg:order-1 flex-1 lg:pr-4">
          <div className="space-y-4">
            <Header
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
                  ? Array.from({ length: 9 }).map((_, i) => (
                      <CardSkeleton key={i} />
                    ))
              : (data?.items || []).map((project: any) => (
                  <PublicProjectCard key={project.id} project={project} />
                ))}
              </div>
            </Content>
          </div>
        </div>

        {/* Desktop Filter Sidebar */}
        <div className="order-1 lg:order-2 hidden lg:block">
          <ProjectFilterSidebar values={filters} onChange={handleFilterChange} />
        </div>

        {/* Mobile Filter Overlay */}
        {showFilters && (
          <>
            <div
              className="fixed inset-0 z-[60] bg-black/30 lg:hidden"
              onClick={() => toggleFilters(false)}
            />
            <div className="fixed inset-y-0 right-0 z-[60] w-auto min-w-[16rem] bg-background shadow-xl lg:hidden">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <span className="font-medium">Filters</span>
                <button
                  className="rounded-md border p-1.5 hover:bg-muted"
                  onClick={() => toggleFilters(false)}
                  aria-label="Close filters"
                >
                  <X size={18} />
                </button>
              </div>
              <ProjectFilterSidebar
                isOverlay
                values={filters}
                onChange={handleFilterChange}
              />
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}