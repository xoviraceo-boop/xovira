"use client";
import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Shell from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { PageHeader } from "@/entities/shared/components/PageHeader";
import { SearchSection } from "@/entities/shared/components/SearchSection";
import { MaterialCard, MaterialFilterSidebar, useMaterialList } from "@/entities/material";
import { MaterialCreationModal } from "@/entities/material/components/MaterialCreationModal";
import { useToast } from "@/hooks/useToast";
import { trpc } from "@/lib/trpc";

export default function MaterialsPage() {
	const router = useRouter();
	const { toast } = useToast();
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
	} = useMaterialList();
	const createMaterial = trpc.material.create.useMutation();
	const purchaseMaterial = trpc.material.purchase.useMutation();

	const [showFilters, setShowFilters] = useState(false);
	const hasNextPage = (data?.items?.length || 0) === pageSize;
	const hasPreviousPage = page > 1;

	const categories = useMemo(() => {
		if (!data?.items) return [];
		return data.items.map((item) => item.category || "").filter(Boolean);
	}, [data?.items]);

	const filterChips = useMemo(() => {
		const chips: Array<{ id: string; label: string; onRemove: () => void }> = [];
		if (query) chips.push({ id: "query", label: `Search: ${query}`, onRemove: () => setQuery("") });
		if (filters.category) {
			chips.push({
				id: "category",
				label: `Category: ${filters.category}`,
				onRemove: () => setFilters((prev) => ({ ...prev, category: undefined })),
			});
		}
		if (typeof filters.isPublic === "boolean") {
			chips.push({
				id: "visibility",
				label: `Visibility: ${filters.isPublic ? "Public" : "Private"}`,
				onRemove: () => setFilters((prev) => ({ ...prev, isPublic: undefined })),
			});
		}
		if (filters.priceRange?.[0] != null || filters.priceRange?.[1] != null) {
			const [min, max] = filters.priceRange;
			chips.push({
				id: "price",
				label: `Price: ${min ?? 0} – ${max ?? "∞"} USD`,
				onRemove: () => setFilters((prev) => ({ ...prev, priceRange: undefined })),
			});
		}
		return chips;
	}, [query, filters, setQuery, setFilters]);

	const clearFilters = () => {
		setQuery("");
		setFilters({});
	};

	const handleCreateMaterial = async () => {
		try {
			const material = await createMaterial.mutateAsync({
				title: "New material",
				description: "",
				category: "General",
				priceUsd: 0,
				isPublic: true,
			});
			toast({ title: "Material created", description: "Redirecting to material details…" });
			router.push(`/dashboard/materials/${material.id}`);
		} catch (error) {
			console.error(error);
			toast({
				title: "Unable to create material",
				description: "Something went wrong while creating the material.",
				variant: "destructive",
			});
		}
	};

	const handlePurchase = async (materialId: string) => {
		try {
			await purchaseMaterial.mutateAsync({ materialId });
			toast({ title: "Purchase complete", description: "Material purchase recorded." });
		} catch (error) {
			console.error(error);
			toast({
				title: "Unable to purchase material",
				description: "An error occurred while processing the purchase.",
				variant: "destructive",
			});
		}
	};

	return (
		<>
		<Shell>
			<div className="grid grid-cols-1 gap-0 lg:grid-cols-[1fr_var(--filter-sidebar-width,_18rem)]">
				<div className="order-2 space-y-6 lg:order-1 lg:pr-4">
					<PageHeader
						title="Materials"
						description="Publish resources, templates, and playbooks that others can access."
						actions={
						<Button
							onClick={() => setIsCreateModalOpen(true)}
							className="group relative overflow-hidden bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 px-5 py-2.5 text-white transition-all duration-300 hover:shadow-md"
						>
							<span className="relative z-10 flex items-center gap-2">
								<Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
							</span>
							<span className="absolute inset-0 bg-gradient-to-r from-rose-400 via-orange-500 to-amber-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
						</Button>
						}
					/>
					<SearchSection
						searchValue={query}
						searchPlaceholder="Search materials by title, category, or keyword..."
						resultsCount={data?.total ?? 0}
						onSearchChange={setQuery}
						onSearchSubmit={() => setPage(1)}
						onCreateNew={() => setIsCreateModalOpen(true)}
						onFilterToggle={() => setShowFilters(true)}
						createButtonText="Add material"
						showFilters
						showSort={false}
					/>

					{filterChips.length > 0 && (
						<div className="flex flex-wrap items-center gap-2">
							{filterChips.map((chip) => (
								<button
									key={chip.id}
									onClick={chip.onRemove}
									className="group inline-flex items-center gap-2 rounded-lg border-2 border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 transition-all hover:border-rose-300 hover:bg-rose-100 hover:shadow"
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
								<MaterialCard
									key={item.id}
									item={item}
									onOpen={(id) => router.push(`/dashboard/materials/${id}`)}
									onManage={(id) => router.push(`/dashboard/materials/${id}`)}
									onPurchase={handlePurchase}
								/>
							))}
						</div>
					) : (
						<div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/10 p-8 text-center">
							<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-orange-100">
								<Plus className="h-8 w-8 text-rose-600" />
							</div>
							<h3 className="mt-4 text-lg font-semibold text-foreground">No materials published</h3>
							<p className="mt-2 text-sm text-muted-foreground">
								{query ? "Try adjusting your search or filters." : "Share your resources with the community by adding a material."}
							</p>
							<Button onClick={() => setIsCreateModalOpen(true)}>
								<Plus className="mr-2 h-4 w-4" />
								New Material
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
					<MaterialFilterSidebar
						scope={scope}
						onScopeChange={setScope}
						values={filters}
						onChange={setFilters}
						categories={categories}
					/>
				</div>

				{showFilters && (
					<>
						<div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setShowFilters(false)} />
						<div className="fixed inset-y-0 right-0 z-[60] w-auto min-w-[18rem] max-w-sm bg-background shadow-xl lg:hidden">
							<div className="flex items-center justify-between border-b px-4 py-3">
								<span className="font-medium">Filters</span>
								<Button
									variant="ghost"
									size="sm"
									className="h-8 px-2 lg:px-3"
									onClick={() => setShowFilters(!showFilters)}
								>
									<X className="mr-2 h-4 w-4" />
									Clear Filters
								</Button>
								<Button
									variant="outline"
									size="sm"
									className="h-8 px-2 lg:px-3"
									onClick={() => setIsCreateModalOpen(true)}
								>
									<Plus className="mr-2 h-4 w-4" />
									New Material
								</Button>
							</div>
							<MaterialFilterSidebar
								scope={scope}
								onScopeChange={setScope}
								values={filters}
								onChange={setFilters}
								categories={categories}
								isOverlay
							/>
						</div>
					</>
				)}
			</div>
		</Shell>

		<MaterialCreationModal
			open={isCreateModalOpen}
			onOpenChange={setIsCreateModalOpen}
			onCreated={() => {
				setIsCreateModalOpen(false)
				// Refresh the list after creation
				router.refresh()
			}}
		/>
		</>
	);
}
