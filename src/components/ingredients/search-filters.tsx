"use client";

import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ingredientCategories } from "@/lib/validations/ingredient";
import { CATEGORY_LABELS } from "@/lib/utils";

interface SearchFiltersProps {
  initialCategory?: string;
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

export function SearchFilters({ initialCategory = "", onFilterChange }: SearchFiltersProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const orderOptions = useMemo(() => SORT_ORDER_OPTIONS[sortBy] ?? SORT_ORDER_OPTIONS.name, [sortBy]);

  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);

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
      <Select
        options={categoryOptions}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full"
      />
      <div>
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-stone-500">Sort</p>
        <div className="flex items-end gap-2">
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs font-medium text-stone-500">Sort by</label>
            <Select
              options={[
                { value: "name", label: "Name" },
                { value: "quantity", label: "Quantity" },
                { value: "createdAt", label: "Date added" },
              ]}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs font-medium text-stone-500">Order</label>
            <Select
              options={orderOptions}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
