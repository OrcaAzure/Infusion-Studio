"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Leaf } from "lucide-react";
import { DashboardHeader } from "@/components/layout/sidebar";
import { IngredientCard } from "@/components/ingredients/ingredient-card";
import { SearchFilters } from "@/components/ingredients/search-filters";
import { Button } from "@/components/ui/button";
import { LoadingSpinner, EmptyState } from "@/components/ui/empty-state";
import type { IngredientWithMeta } from "@/types";

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<IngredientWithMeta[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIngredients = useCallback(
    async (filters: { search: string; category: string; sortBy: string; sortOrder: string }) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.category) params.set("category", filters.category);
      params.set("sortBy", filters.sortBy);
      params.set("sortOrder", filters.sortOrder);

      const res = await fetch(`/api/ingredients?${params}`);
      const data = await res.json();
      setIngredients(data);
      setLoading(false);
    },
    []
  );

  useEffect(() => {
    fetchIngredients({ search: "", category: "", sortBy: "name", sortOrder: "asc" });
  }, [fetchIngredients]);

  return (
    <div>
      <DashboardHeader
        title="Ingredient Inventory"
        description="Manage your teas, herbs, spices, and more"
        action={
          <Link href="/ingredients/new">
            <Button>
              <Plus className="h-4 w-4" />
              Add ingredient
            </Button>
          </Link>
        }
      />

      <div className="mb-6">
        <SearchFilters onFilterChange={fetchIngredients} />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : ingredients.length === 0 ? (
        <EmptyState
          icon={<Leaf className="h-6 w-6" />}
          title="No ingredients found"
          description="Start building your inventory by adding your first ingredient"
          action={
            <Link href="/ingredients/new">
              <Button>Add ingredient</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ingredients.map((ing, i) => (
            <IngredientCard key={ing.id} ingredient={ing} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
