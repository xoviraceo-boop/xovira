"use client";
import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Shell from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { PageHeader } from "@/entities/shared/components/PageHeader";
import { SearchSection } from "@/entities/shared/components/SearchSection";
import { SpaceCard, SpaceFilterSidebar, useSpaceList } from "@/entities/space";
import { useToast } from "@/hooks/useToast";
import { trpc } from "@/lib/trpc";

export default function SpacesPage() {
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
	} = useSpaceList();

	const [showFilters, setShowFilters] = useState(false);
	const createMutation = trpc.space.create.useMutation();
	const { data: workspaceOptions } = trpc.workspace.list.useQuery(
		{ scope: "all", pageSize: 50, includeCounts: false },
		{ staleTime: 60_000 }
	);

	const hasNextPage = (data?.items?.length || 0) === pageSize;
	const hasPreviousPage = page > 1;

	const workspaceLookup = useMemo(() => {
		const map = new Map<string, string>();
		workspaceOptions?.items?.forEach((workspace) => map.set(workspace.id, workspace.name));
		return map;
	}, [workspaceOptions?.items]);

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
		if (filters.workspaceId) {
			chips.push({
				id: "workspaceId",
				label: `Workspace: ${workspaceLookup.get(filters.workspaceId) ?? filters.workspaceId}`,
				onRemove: () => setFilters((prev) => ({ ...prev, workspaceId: undefined })),
			});
		}
		return chips;
	}, [query, filters, setFilters, setQuery, workspaceLookup]);

	const clearFilters = () => {
		setQuery("");
		setFilters({ status: "", workspaceId: undefined });
	};

	const handleCreateSpace = async () => {
		const availableWorkspaces = workspaceOptions?.items ?? [];
		const targetWorkspaceId = filters.workspaceId || (availableWorkspaces.length === 1 ? availableWorkspaces[0].id : undefined);

		if (!targetWorkspaceId) {
			toast({
				title: "Select a workspace first",
				description: "Choose the workspace where the new space should live.",
				variant: "destructive",
			});
			return;
		}

		try {
			const space = await createMutation.mutateAsync({
				name: "Untitled space",
				description: "",
				workspaceId: targetWorkspaceId,
			});
			toast({ title: "Space created", description: "Redirecting to your new space..." });
			if (!filters.workspaceId) {
				setFilters((prev) => ({ ...prev, workspaceId: targetWorkspaceId }));
			}
			router.push(`/dashboard/spaces/${space.id}`);
		} catch (error) {
			console.error(error);
			toast({
				title: "Unable to create space",
				description: "Something went wrong while creating the space. Please try again.",
				variant: "destructive",
			});
		}
	};

	return (
		<Shell>
			<div className="grid grid-cols-1 gap-0 lg:grid-cols-[1fr_var(--filter-sidebar-width,_18rem)]">
				<div className="order-2 space-y-6 lg:order-1 lg:pr-4">
					<PageHeader
						title="Spaces"
						description="Organize projects, tools, and materials within collaborative spaces."
						actions={
							<Button
								onClick={handleCreateSpace}
								className="group relative overflow-hidden bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 px-5 py-2.5 text-white transition-all duration-300 hover:shadow-md"
							>
								<span className="relative z-10 flex items-center gap-2">
									<Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
									New space
								</span>
								<span className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-blue-500 to-cyan-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
							</Button>
						}
					/>

					<SearchSection
						searchValue={query}
						searchPlaceholder="Search spaces by name or keyword..."
						resultsCount={data?.total ?? 0}
						onSearchChange={setQuery}
						onSearchSubmit={() => setPage(1)}
						onCreateNew={handleCreateSpace}
						onFilterToggle={() => setShowFilters(true)}
						createButtonText="New space"
						showFilters
						showSort={false}
					/>

					{filterChips.length > 0 && (
						<div className="flex flex-wrap items-center gap-2">
							{filterChips.map((chip) => (
								<button
									key={chip.id}
									onClick={chip.onRemove}
									className="group inline-flex items-center gap-2 rounded-lg border-2 border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition-all hover:border-indigo-300 hover:bg-indigo-100 hover:shadow"
								>
									<span>{chip.label}</span>
									<X className="h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
								</button>
							))}
							<Button variant="ghost" onClick={clearFilters}>
								Clear all
							</Button>
						</div>
					)}

					{isLoading ? (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
							{Array.from({ length: 6 }).map((_, index) => (
								<div key={index} className="min-h-[220px] animate-pulse rounded-lg border bg-muted/30" />
							))}
						</div>
					) : data?.items && data.items.length > 0 ? (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
							{data.items.map((item) => (
								<SpaceCard
									key={item.id}
									item={item}
									onOpen={(id) => router.push(`/dashboard/spaces/${id}`)}
									onManage={(id) => router.push(`/dashboard/spaces/${id}`)}
								/>
							))}
						</div>
					) : (
						<div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/10 p-8 text-center">
							<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-blue-100">
								<Plus className="h-8 w-8 text-indigo-500" />
							</div>
							<h3 className="mt-4 text-lg font-semibold text-foreground">No spaces yet</h3>
							<p className="mt-2 text-sm text-muted-foreground">
								{query ? "Try a different search or reset your filters." : "Create a space to structure your work."}
							</p>
							<Button onClick={handleCreateSpace} variant="outline" className="mt-4">
								<Plus className="mr-2 h-4 w-4" />
								Add space
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
					<SpaceFilterSidebar scope={scope} onScopeChange={setScope} values={filters} onChange={setFilters} />
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
							<SpaceFilterSidebar scope={scope} onScopeChange={setScope} values={filters} onChange={setFilters} isOverlay />
						</div>
					</>
				)}
			</div>
		</Shell>
	);
}


