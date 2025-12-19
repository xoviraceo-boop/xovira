"use client";
import SearchBar from "../../components/SearchBar";
import { cn } from "@/lib/utils";

interface MarketplaceHeaderProps {
  title?: string;
  description?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  showFilterButton?: boolean;
  onFilterClick?: () => void;
  className?: string;
  navigateTo?: string;
}

export default function MarketplaceHeader({
  title = "Marketplace",
  description = "Discover published proposals.",
  searchValue,
  onSearchChange,
  onSearchSubmit,
  showFilterButton = false,
  onFilterClick,
  className,
  navigateTo
}: MarketplaceHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          onSubmit={onSearchSubmit}
          navigateTo={navigateTo}
        />
        {showFilterButton && (
          <button
            className="rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted lg:hidden"
            onClick={onFilterClick}
            aria-label="Open filters"
            type="button"
          >
            Filters
          </button>
        )}
      </div>
    </div>
  );
}