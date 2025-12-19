"use client";
import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";

export type ToolScope = "owned" | "all";

type FilterState = {
	category?: string;
	isPublic?: boolean;
};

export function useToolList(initialScope: ToolScope = "owned") {
	const [page, setPage] = useState(1);
	const pageSize = 12;
	const [query, setQuery] = useState("");
	const [scope, setScope] = useState<ToolScope>(initialScope);
	const [filters, setFilters] = useState<FilterState>({});

	const listInput = useMemo(
		() => ({
			page,
			pageSize,
			scope,
			query: query.trim() || undefined,
			category: filters.category,
			isPublic: typeof filters.isPublic === "boolean" ? filters.isPublic : undefined,
		}),
		[page, pageSize, scope, query, filters],
	);

	const queryResult = trpc.tool.list.useQuery(listInput as any, { staleTime: 30_000 });
	const utils = trpc.useUtils();

	useEffect(() => {
		setPage(1);
	}, [query, scope, filters.category, filters.isPublic]);

	useEffect(() => {
		const params = new URLSearchParams();
		if (query) params.set("q", query);
		params.set("scope", scope);
		if (filters.category) params.set("category", filters.category);
		if (typeof filters.isPublic === "boolean") params.set("isPublic", String(filters.isPublic));
		params.set("page", String(page));
		if (typeof window !== "undefined") {
			const nextUrl = `${window.location.pathname}?${params.toString()}`;
			window.history.replaceState(null, "", nextUrl);
		}
	}, [query, scope, filters.category, filters.isPublic, page]);

	useEffect(() => {
		utils.tool.list.prefetch({ ...listInput, page: 1 } as any);
	}, [utils, listInput.scope, listInput.category, listInput.isPublic, listInput.query]);

	useEffect(() => {
		if ((queryResult.data?.items?.length || 0) === pageSize) {
			utils.tool.list.prefetch({ ...listInput, page: page + 1 } as any);
		}
	}, [utils, queryResult.data?.items?.length, pageSize, page, listInput]);

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



