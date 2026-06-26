"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ingredientCategories } from "@/lib/validations/ingredient";
import { CATEGORY_LABELS } from "@/lib/utils";

interface SearchFiltersProps {
  onFilterChange: (filters: {
    search: string;
    category: string;
    sortBy: string;
    sortOrder: string;
  }) => void;
}

export function SearchFilters({ onFilterChange }: SearchFiltersProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search, category, sortBy, sortOrder });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, category, sortBy, sortOrder, onFilterChange]);

  const categoryOptions = [
    { value: "", label: "All categories" },
    ...ingredientCategories.map((c) => ({ value: c, label: CATEGORY_LABELS[c] })),
  ];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <Input
          placeholder="Search ingredients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select
        options={categoryOptions}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="sm:w-44"
      />
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-stone-400" />
        <Select
          options={[
            { value: "name", label: "Name" },
            { value: "quantity", label: "Quantity" },
            { value: "createdAt", label: "Date added" },
          ]}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-32"
        />
        <Select
          options={[
            { value: "asc", label: "Asc" },
            { value: "desc", label: "Desc" },
          ]}
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="w-24"
        />
      </div>
    </div>
  );
}
