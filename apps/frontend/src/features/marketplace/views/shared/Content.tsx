"use client";
import { ReactNode } from "react";
import { Toolbar } from "../../components/Toolbar";
import { Pagination } from "@/components/ui/pagination";
import { ContentSection } from "../../components/ContentSection";
import { ChipGroup } from "@/components/ui/chip";
import { cn } from "@/lib/utils";

interface FilterChip {
  id: string;
  label: string;
  onRemove: () => void;
}

interface MarketplaceContentProps {
  // Toolbar props
  resultCount: number;
  sortBy: string;
  sortOptions: Array<{ value: string; label: string }>;
  onSortChange: (value: string) => void;

  // Filter chips
  filterChips?: FilterChip[];
  onClearAllFilters?: () => void;

  // Content
  children: ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyState?: ReactNode;

  // Pagination
  currentPage: number;
  totalPages?: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;

  className?: string;
}

export default function MarketplaceContent({
  resultCount,
  sortBy,
  sortOptions,
  onSortChange,
  filterChips = [],
  onClearAllFilters,
  children,
  isLoading,
  isEmpty,
  emptyState,
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  className,
}: MarketplaceContentProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <Toolbar
        resultCount={resultCount}
        sortBy={sortBy}
        sortOptions={sortOptions}
        onSortChange={onSortChange}
        isLoading={isLoading}
      />

      {filterChips.length > 0 && (
        <ChipGroup chips={filterChips} onClearAll={onClearAllFilters} />
      )}

      <ContentSection isLoading={isLoading} isEmpty={isEmpty} emptyState={emptyState}>
        {children}
      </ContentSection>

      {!isEmpty && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          onPageChange={onPageChange}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}