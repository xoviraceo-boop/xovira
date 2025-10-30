"use client";
import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";

export type ProposalScope = "all" | "owned" | "saved" | "interested";

export function useProposalList() {
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [sortBy, setSortBy] = useState<string>("latest");
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<ProposalScope>("owned");
  const [filters, setFilters] = useState<{ industries: string[]; country?: string; commitment?: any; urgency?: any; minFunding?: number; maxFunding?: number; status?: "DRAFT"|"PUBLISHED"|"ARCHIVED"|"" }>(
    { industries: [], status: "" as any }
  );

  const listInput = useMemo(
    () => ({
      page,
      pageSize,
      sortBy,
      scope,
      query: query.trim() || undefined,
      industries: filters.industries?.length ? filters.industries : undefined,
      country: filters.country || undefined,
      commitment: (filters.commitment as any) || undefined,
      urgency: (filters.urgency as any) || undefined,
      minFunding: typeof filters.minFunding === "number" ? filters.minFunding : undefined,
      maxFunding: typeof filters.maxFunding === "number" ? filters.maxFunding : undefined,
      status: (filters.status || undefined) as any,
    }),
    [page, pageSize, sortBy, scope, query, filters]
  );

  const { data, isLoading, isFetching } = trpc.proposal.list.useQuery(listInput, {
    staleTime: 30_000,
  });
  const utils = trpc.useUtils();

  useEffect(() => { setPage(1); }, [query, sortBy, scope, filters]);

  // Prefetch first pages on filter/sort change
  useEffect(() => {
    const base = { ...listInput, page: 1 } as any;
    utils.proposal.list.prefetch(base);
    utils.proposal.list.prefetch({ ...base, page: 2 });
  }, [utils, listInput.query, listInput.scope, listInput.sortBy, listInput.industries, listInput.country, listInput.commitment, listInput.urgency, listInput.minFunding, listInput.maxFunding, listInput.status]);

  // Prefetch next page when full
  useEffect(() => {
    if ((data?.items?.length || 0) === pageSize) {
      utils.proposal.list.prefetch({ ...listInput, page: page + 1 } as any);
    }
  }, [utils, data?.items?.length, pageSize, page, listInput]);

  // URL sync
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (scope) params.set("scope", scope);
    if (filters.status) params.set("status", String(filters.status));
    params.set("page", String(page));
    params.set("sort", sortBy);
    history.replaceState(null, "", `${location.pathname}?${params.toString()}`);
  }, [query, scope, sortBy, page, filters.status]);

  return {
    data,
    isLoading,
    isFetching,
    page,
    pageSize,
    setPage,
    sortBy,
    setSortBy,
    query,
    setQuery,
    scope,
    setScope,
    filters,
    setFilters,
  };
}


