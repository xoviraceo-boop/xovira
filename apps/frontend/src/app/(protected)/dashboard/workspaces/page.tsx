"use client";
import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Shell from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { WorkspaceCard, WorkspaceFilterSidebar, useWorkspaceList, WorkspaceCreationModal } from "@/entities/workspace";
import { PageHeader } from "@/entities/shared/components/PageHeader";
import { SearchSection } from "@/entities/shared/components/SearchSection";
import { useToast } from "@/hooks/useToast";
import { DASHBOARD_ROUTES } from "@/constants/routes.config";

export default function WorkspacesPage() {
	const router = useRouter();
	const { toast } = useToast();
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
	} = useWorkspaceList();

	const [showFilters, setShowFilters] = useState(false);

	const hasNextPage = (data?.items?.length || 0) === pageSize;
	const hasPreviousPage = page > 1;

	const filterChips = useMemo(() => {
		const chips: Array<{ id: string; label: string; onRemove: () => void }> = [];
		if (query) {
			chips.push({ id: "query", label: `Search: ${query}`, onRemove: () => setQuery("") });
		}
		if (filters.status) {
			chips.push({
				id: "status",
				label: `Status: ${filters.status}`,
				onRemove: () => setFilters((prev) => ({ ...prev, status: "" })),
			});
		}
		return chips;
	}, [query, filters, setQuery, setFilters]);

	const clearFilters = () => {
		setQuery("");
		setFilters({ status: "" });
	};

	const [showCreateModal, setShowCreateModal] = useState(false);
	const handleCreateWorkspace = () => setShowCreateModal(true);

	return (
		<Shell>
			<div className="grid grid-cols-1 gap-0 lg:grid-cols-[1fr_var(--filter-sidebar-width,_18rem)]">
				<div className="order-2 space-y-6 lg:order-1 lg:pr-4">
					<PageHeader
						title="Workspaces"
						description="Manage your collaboration spaces."
						actions={
							<Button
								onClick={handleCreateWorkspace}
								className="h-7 bg-zinc-900 px-2.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
							>
								<Plus className="mr-1.5 h-3 w-3" />
								New Workspace
							</Button>
						}
					/>

					<SearchSection
						searchValue={query}
						searchPlaceholder="Search workspaces..."
						resultsCount={data?.total ?? 0}
						onSearchChange={setQuery}
						onSearchSubmit={() => setPage(1)}
						onCreateNew={handleCreateWorkspace}
						onFilterToggle={() => setShowFilters(true)}
						createButtonText="New workspace"
						showFilters
						showSort={false}
					/>

					{filterChips.length > 0 && (
						<div className="flex flex-wrap items-center gap-2">
							{filterChips.map((chip) => (
								<button
									key={chip.id}
									onClick={chip.onRemove}
									className="group inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
								>
									<span>{chip.label}</span>
									<X className="h-3 w-3 text-zinc-400 group-hover:text-zinc-600" />
								</button>
							))}
							<Button
								variant="ghost"
								onClick={clearFilters}
								className="h-7 px-2 text-xs text-zinc-500 hover:text-zinc-900"
							>
								Clear all
							</Button>
						</div>
					)}

					{isLoading ? (
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{Array.from({ length: 6 }).map((_, index) => (
								<div key={index} className="h-[200px] animate-pulse rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900" />
							))}
						</div>
					) : data?.items && data.items.length > 0 ? (
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{data.items.map((item) => (
								<WorkspaceCard
									key={item.id}
									item={item}
									onOpen={(id) => router.push(DASHBOARD_ROUTES.WORKSPACE(id))}
								/>
							))}
						</div>
					) : (
						<div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
								<Plus className="h-6 w-6 text-zinc-400" />
							</div>
							<h3 className="mt-4 text-base font-medium text-zinc-900 dark:text-zinc-50">No workspaces found</h3>
							<p className="mt-1 text-sm text-zinc-500">
								{query ? "Try adjusting your search or filters." : "Get started by creating a new workspace."}
							</p>
							<Button onClick={handleCreateWorkspace} size="sm" variant="outline" className="mt-8 border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 max-w-40">
								Create workspace
							</Button>
						</div>
					)}

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

				<div className="order-1 hidden lg:order-2 lg:block">
					<WorkspaceFilterSidebar
						scope={scope}
						onScopeChange={setScope}
						values={filters}
						onChange={setFilters}
					/>
				</div>

				{showFilters && (
					<>
						<div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setShowFilters(false)} />
						<div className="fixed inset-y-0 right-0 z-[60] w-auto min-w-[18rem] max-w-sm bg-background shadow-xl lg:hidden">
							<div className="flex items-center justify-between border-b px-4 py-3">
								<span className="font-medium">Filters</span>
								<button
									className="rounded-md border p-1.5 hover:bg-muted"
									onClick={() => setShowFilters(false)}
									aria-label="Close filters"
								>
									<X className="h-4 w-4" />
								</button>
							</div>
							<WorkspaceFilterSidebar
								scope={scope}
								onScopeChange={setScope}
								values={filters}
								onChange={setFilters}
								isOverlay
							/>
						</div>
					</>
				)}
			</div>
			<WorkspaceCreationModal
				open={showCreateModal}
				onOpenChange={setShowCreateModal}
				onCreated={(id) => {
					toast({ title: "Workspace created", description: "Redirecting to workspace overview…" });
					router.push(DASHBOARD_ROUTES.WORKSPACE(id));
				}}
			/>
		</Shell>
	);
}



