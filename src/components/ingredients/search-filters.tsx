"use client";

import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
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

const SORT_ORDER_OPTIONS: Record<string, { value: string; label: string }[]> = {
  name: [
    { value: "asc", label: "A → Z" },
    { value: "desc", label: "Z → A" },
  ],
  createdAt: [
    { value: "desc", label: "Most recent" },
    { value: "asc", label: "Oldest" },
  ],
  quantity: [
    { value: "asc", label: "Low → High" },
    { value: "desc", label: "High → Low" },
  ],
};

export function SearchFilters({ onFilterChange }: SearchFiltersProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const orderOptions = useMemo(() => SORT_ORDER_OPTIONS[sortBy] ?? SORT_ORDER_OPTIONS.name, [sortBy]);

  useEffect(() => {
    const valid = orderOptions.some((o) => o.value === sortOrder);
    if (!valid) setSortOrder(orderOptions[0].value);
  }, [sortBy, orderOptions, sortOrder]);

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
    <div className="flex flex-col gap-3">
      <div className="relative w-full">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <Input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10"
          aria-label="Search ingredients by name"
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          options={categoryOptions}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="sm:flex-1"
        />
        <Select
          options={[
            { value: "name", label: "Sort: Name" },
            { value: "quantity", label: "Sort: Quantity" },
            { value: "createdAt", label: "Sort: Date added" },
          ]}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sm:w-44"
        />
        <Select
          options={orderOptions}
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="sm:w-40"
        />
      </div>
    </div>
  );
}
