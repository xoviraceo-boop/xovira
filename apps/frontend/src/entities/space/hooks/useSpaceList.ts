"use client";
import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";

export type SpaceScope = "owned" | "member" | "all";

type FilterState = {
	status?: "active" | "archived" | "";
	workspaceId?: string;
};

export function useSpaceList(initialScope: SpaceScope = "owned") {
	const [page, setPage] = useState(1);
	const pageSize = 12;
	const [query, setQuery] = useState("");
	const [scope, setScope] = useState<SpaceScope>(initialScope);
	const [filters, setFilters] = useState<FilterState>({ status: "active" });

	const listInput = useMemo(() => {
		const trimmedQuery = query.trim();
		const normalizedStatus =
			filters.status === "active" || filters.status === "archived" ? filters.status : undefined;

		return {
			page,
			pageSize,
			query: trimmedQuery || undefined,
			scope,
			status: normalizedStatus,
			workspaceId: filters.workspaceId || undefined,
			includeCounts: true,
		};
	}, [page, pageSize, query, scope, filters.status, filters.workspaceId]);

	const queryResult = trpc.space.list.useQuery(listInput, {
		staleTime: 30_000,
	});
	const utils = trpc.useUtils();

	useEffect(() => {
		setPage(1);
	}, [query, scope, filters.status, filters.workspaceId]);

	useEffect(() => {
		utils.space.list.prefetch({ ...listInput, page: 1 });
	}, [utils, listInput]);

	useEffect(() => {
		if ((queryResult.data?.items?.length || 0) === pageSize) {
			utils.space.list.prefetch({ ...listInput, page: page + 1 });
		}
	}, [utils, queryResult.data?.items?.length, pageSize, page, listInput]);

	useEffect(() => {
		const params = new URLSearchParams();
		if (query) params.set("q", query);
		if (scope) params.set("scope", scope);
		if (filters.status) params.set("status", filters.status);
		if (filters.workspaceId) params.set("workspaceId", filters.workspaceId);
		params.set("page", String(page));
		if (typeof window !== "undefined") {
			const url = `${window.location.pathname}?${params.toString()}`;
			window.history.replaceState(null, "", url);
		}
	}, [query, scope, filters.status, filters.workspaceId, page]);

	return {
		...queryResult,
		page,
		pageSize,
		setPage,
		query,
		setQuery,
		scope,
		setScope,
		filters,
		setFilters,
	};
}


