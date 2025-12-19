"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import SearchBar from "@/features/dashboard/components/SearchBar";

interface SearchSectionProps {
  searchValue: string;
  searchPlaceholder?: string;
  resultsCount?: number;
  sortBy?: string;
  sortOptions?: Array<{ value: string; label: string }>;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onSortChange?: (value: string) => void;
  onCreateNew: () => void;
  onFilterToggle?: () => void;
  createButtonText?: string;
  showFilters?: boolean;
  showSort?: boolean;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  searchValue,
  searchPlaceholder = "Search...",
  resultsCount = 0,
  sortBy,
  sortOptions = [
    { value: "latest", label: "Latest First" },
    { value: "relevance", label: "Most Relevant" },
    { value: "oldest", label: "Oldest First" },
  ],
  onSearchChange,
  onSearchSubmit,
  onSortChange,
  onCreateNew,
  onFilterToggle,
  createButtonText = "Create New",
  showFilters = true,
  showSort = true,
}) => {
  return (
    <div className="py-6 sm:py-8 bg-gradient-to-br from-gray-50 to-white">
      <div className="flex flex-col gap-4">
        {/* Search Bar and Filter Button Row (Mobile) */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <SearchBar
              value={searchValue}
              onChange={onSearchChange}
              onSubmit={onSearchSubmit}
              placeholder={searchPlaceholder}
              className="bg-white border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-300 shadow-sm hover:shadow-md"
            />
          </div>

          {/* Mobile Filter Button - Next to Search */}
          {showFilters && onFilterToggle && (
            <button
              onClick={onFilterToggle}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-gray-700 text-sm font-medium shadow-sm hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-300"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span className="hidden sm:inline">Filters</span>
            </button>
          )}
        </div>

        {/* Results Count and Sort Row */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Results Count */}
          <div className="flex items-center gap-2 px-4 py-2 bg-cyan-50 border border-cyan-200 rounded-lg">
            <span className="text-sm font-semibold text-cyan-700">
              {resultsCount.toLocaleString()}
            </span>
            <span className="text-sm text-cyan-600">
              {resultsCount === 1 ? "result" : "results"}
            </span>
          </div>

          {/* Divider */}
          {showSort && <div className="hidden sm:block h-6 w-px bg-gray-300" />}

          {/* Sort Dropdown */}
          {showSort && onSortChange && (
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-gray-700 text-sm font-medium shadow-sm hover:bg-gray-50 hover:border-gray-300 focus:bg-white focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200 transition-all duration-300 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23374151%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
};
