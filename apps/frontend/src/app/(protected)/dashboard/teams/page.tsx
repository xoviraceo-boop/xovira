"use client";
import Shell from "@/components/layout/Shell";
import TeamCard from "@/entities/teams/components/TeamCard";
import TeamFilterSidebar from "@/entities/teams/components/TeamFilterSidebar";
import SearchBar from "@/features/dashboard/components/SearchBar";
import { Pagination } from "@/components/ui/pagination";
import { useTeamList } from "@/entities/teams/hooks/useTeamList";
import { X } from "lucide-react";
import React, { useState } from "react";

export default function TeamsPage() {
	const {
		data,
		isLoading,
		isFetching,
		page,
		pageSize,
		setPage,
		query,
		setQuery,
		scope,
		setScope,
		filters,
		setFilters,
	} = useTeamList();

	const hasNextPage = (data?.items?.length || 0) === pageSize;
	const hasPreviousPage = page > 1;

	const TeamFS: any = TeamFilterSidebar as any;
	const [showFilters, setShowFilters] = useState(false);

	const chips = React.useMemo(() => {
		const result: Array<{ id: string; label: string; onRemove: () => void }> = [];
		if (query) result.push({ id: "q", label: `q: ${query}`, onRemove: () => setQuery("") });
		(filters.industries || []).forEach((ind: string) => {
			result.push({ id: `ind-${ind}`, label: ind, onRemove: () => setFilters((f: any) => ({ ...f, industries: (f.industries || []).filter((x: string) => x !== ind) })) });
		});
		if ((filters as any).status) result.push({ id: "status", label: `status: ${(filters as any).status}`, onRemove: () => setFilters((f: any) => ({ ...f, status: "" as any })) });
		return result;
	}, [query, filters, setFilters, setQuery]);

	const clearAll = () => {
		setQuery("");
		setFilters((f: any) => ({ ...f, industries: [], status: "" as any }));
	};
	return (
		<Shell>
			<div className="grid grid-cols-1 lg:grid-cols-[1fr_var(--filter-sidebar-width,_18rem)] gap-0">
				<div className="order-2 lg:order-1 flex-1 lg:pr-4 space-y-6">
					<div className="flex flex-col gap-2">
						<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Teams</h1>
						<p className="text-muted-foreground">Create new teams, filter, and manage.</p>
					</div>

					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center gap-2">
							<button className="rounded-md border px-3 py-2 text-sm" onClick={() => (window.location.href = "/dashboard/teams/new/" + Date.now())}>+ New</button>
							<SearchBar value={query} onChange={setQuery} onSubmit={() => setPage(1)} placeholder="Search teams" />
						</div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">{data?.total ?? 0} results</span>
                            <button className="rounded-md border px-3 py-2 text-sm lg:hidden" onClick={() => setShowFilters(true)}>Filters</button>
                        </div>
					</div>

					{/* Filter chips */}
					{chips.length > 0 && (
						<div className="flex flex-wrap items-center gap-2 text-xs">
							{chips.map((c) => (
								<button key={c.id} onClick={c.onRemove} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 hover:bg-muted">
									<span>{c.label}</span>
									<span aria-hidden>×</span>
								</button>
							))}
							<button onClick={clearAll} className="ml-2 inline-flex items-center gap-1 rounded-md border px-2 py-1 hover:bg-muted">Clear all</button>
						</div>
					)}

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
						{isLoading ? (
							Array.from({ length: 9 }).map((_, i) => <div key={i} className="min-h-[180px] rounded-md border" />)
						) : (
							(data?.items || []).map((t: any) => <TeamCard key={t.id} item={t} onOpen={(id) => (window.location.href = `/dashboard/teams/${id}`)} />)
						)}
					</div>

					<Pagination currentPage={page} hasNextPage={hasNextPage} hasPreviousPage={hasPreviousPage} onPageChange={setPage} isLoading={isFetching} />
				</div>

				<div className="order-1 lg:order-2 hidden lg:block">
					<TeamFS scope={scope as any} onScopeChange={(s: any) => setScope(s as any)} values={filters as any} onChange={(next: any) => setFilters(next as any)} />
				</div>

                {showFilters && (
                    <>
                        <div className="fixed inset-0 z-[60] bg-black/30 lg:hidden" onClick={() => setShowFilters(false)} />
                        <div className="fixed inset-y-0 right-0 z-[60] w-auto min-w-[16rem] bg-background shadow-xl lg:hidden">
                            <div className="flex items-center justify-between border-b px-4 py-3">
                                <span className="font-medium">Filters</span>
                                <button className="rounded-md border p-1.5 hover:bg-muted" onClick={() => setShowFilters(false)} aria-label="Close filters"><X size={18} /></button>
                            </div>
                            <TeamFS isOverlay scope={scope as any} onScopeChange={(s: any) => setScope(s as any)} values={filters as any} onChange={(next: any) => setFilters(next as any)} />
                        </div>
                    </>
                )}
			</div>
		</Shell>
	);
}


