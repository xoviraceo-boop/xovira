"use client";
import { Plus, X } from "lucide-react";
import Shell from "@/components/layout/Shell";
import { PageHeader } from "@/entities/shared/components/PageHeader";
import ProposalCard from "@/entities/proposals/components/ProposalCard";
import ProposalFilterSidebar from "@/entities/proposals/components/ProposalFilterSidebar";
import { Pagination } from "@/components/ui/pagination";
import { useProposalList } from "@/entities/proposals/hooks/useProposalList";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function ProposalsPage() {
	const router = useRouter();
	const {
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
	} = useProposalList();

	const hasNextPage = (data?.items?.length || 0) === pageSize;
	const hasPreviousPage = page > 1;
	const [showFilters, setShowFilters] = useState(false);

	// Build filter chips
	const chips = React.useMemo(() => {
		const result: Array<{ id: string; label: string; onRemove: () => void }> = [];
		if (query) result.push({ id: "q", label: `q: ${query}`, onRemove: () => setQuery("") });
		(filters.industries || []).forEach((ind) => {
			result.push({ id: `ind-${ind}`, label: ind, onRemove: () => setFilters((f: any) => ({ ...f, industries: (f.industries || []).filter((x: string) => x !== ind) })) });
		});
		if (filters.country) result.push({ id: "country", label: `country: ${filters.country}`, onRemove: () => setFilters((f: any) => ({ ...f, country: undefined })) });
		if (scope === "owned" && filters.status) result.push({ id: "status", label: `status: ${filters.status}`, onRemove: () => setFilters((f: any) => ({ ...f, status: "" as any })) });
		if (filters.minFunding != null || filters.maxFunding != null) result.push({ id: "funding", label: `funding: ${filters.minFunding ?? 0} - ${filters.maxFunding ?? "∞"}`, onRemove: () => setFilters((f: any) => ({ ...f, minFunding: undefined, maxFunding: undefined })) });
		return result;
	}, [query, filters, scope, setFilters, setQuery]);

	const clearAll = () => {
		setQuery("");
		setFilters((f: any) => ({ ...f, industries: [], country: undefined, status: "" as any, minFunding: undefined, maxFunding: undefined }));
	};
	
	const handleCreateNew = async () => {
		try {
			router.push(`/dashboard/proposals/new`);
		} catch (error) {
			console.error("Failed to create draft proposal:", error);
		}
	};

	return (
		<Shell>
			<div className="grid grid-cols-1 lg:grid-cols-[1fr_var(--filter-sidebar-width,_18rem)] gap-0">
				<div className="order-2 lg:order-1 flex-1 lg:pr-4 space-y-6">
					{/* Enhanced Header Component */}
					<PageHeader
						title="Proposals"
						description="Create new proposals, filter, and manage your submissions."
						searchValue={query}
						searchPlaceholder="Search proposals by title or keyword..."
						resultsCount={data?.total ?? 0}
						sortBy={sortBy}
						onSearchChange={setQuery}
						onSearchSubmit={() => setPage(1)}
						onSortChange={setSortBy}
						onCreateNew={handleCreateNew}
						onFilterToggle={() => setShowFilters(true)}
						createButtonText="Create New"
						showFilters={true}
						showSort={true}
					/>

					{/* Filter Chips */}
					{chips.length > 0 && (
						<div className="flex flex-wrap items-center gap-2">
							{chips.map((c) => (
								<button
									key={c.id}
									onClick={c.onRemove}
									className="group inline-flex items-center gap-2 rounded-lg border-2 border-cyan-200 bg-cyan-50 px-3 py-1.5 text-sm font-medium text-cyan-700 transition-all hover:bg-cyan-100 hover:border-cyan-300 hover:shadow-md"
								>
									<span>{c.label}</span>
									<X className="h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
								</button>
							))}
							<button
								onClick={clearAll}
								className="inline-flex items-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-400 hover:shadow-md"
							>
								Clear all
							</button>
						</div>
					)}

					{/* Results Grid */}
					{isLoading ? (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
							{Array.from({ length: 9 }).map((_, i) => (
								<div key={i} className="min-h-[220px] animate-pulse rounded-lg border bg-muted/30" />
							))}
						</div>
					) : data?.items && data.items.length > 0 ? (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
							{data.items.map((p: any) => (<ProposalCard key={p.id} item={p} />))}
						</div>
					) : (
						<div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50/50">
							<div className="text-center">
								<div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center mb-4">
									<Plus className="h-8 w-8 text-cyan-600" />
								</div>
								<h3 className="mt-4 text-lg font-semibold text-gray-900">No proposals found</h3>
								<p className="mb-4 mt-2 text-sm text-muted-foreground">
									{query ? "Try adjusting your search or filters" : "Get started by creating your first proposal"}
								</p>
								{!query && (
									<Button onClick={handleCreateNew} variant="outline" className="mt-4">
										<Plus className="mr-2 h-4 w-4" />
										Create Your First Proposal
									</Button>
								)}
							</div>
						</div>
					)}

					{/* Pagination */}
					{data?.items && data.items.length > 0 && (
						<Pagination
							currentPage={page}
							hasNextPage={hasNextPage}
							hasPreviousPage={hasPreviousPage}
							onPageChange={setPage}
							isLoading={isFetching}
						/>
					)}
				</div>

				{/* Desktop Filter Sidebar */}
				<div className="order-1 lg:order-2 hidden lg:block">
					<ProposalFilterSidebar
						scope={scope as any}
						onScopeChange={(s) => setScope(s as any)}
						values={filters as any}
						onChange={(next) => setFilters(next as any)}
					/>
				</div>

				{/* Mobile Filter Overlay */}
				{showFilters && (
					<>
						<div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setShowFilters(false)} />
						<div className="fixed inset-y-0 right-0 z-[60] w-auto min-w-[16rem] bg-background shadow-xl lg:hidden">
							<div className="flex items-center justify-between border-b px-4 py-3">
								<span className="font-medium">Filters</span>
								<button
									className="rounded-md border p-1.5 hover:bg-muted"
									onClick={() => setShowFilters(false)}
									aria-label="Close filters"
								>
									<X size={18} />
								</button>
							</div>
							<ProposalFilterSidebar
								isOverlay
								scope={scope as any}
								onScopeChange={(s) => setScope(s as any)}
								values={filters as any}
								onChange={(next) => setFilters(next as any)}
							/>
						</div>
					</>
				)}
			</div>
		</Shell>
	);
}