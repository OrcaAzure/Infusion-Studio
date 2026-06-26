"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Star, Trash2, Timer } from "lucide-react";
import { DashboardHeader } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { CategoryBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner, EmptyState } from "@/components/ui/empty-state";
import { useTimerStore } from "@/stores";
import { formatTime } from "@/lib/utils";
import type { RecipeWithBlend } from "@/types";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<RecipeWithBlend[]>([]);
  const [loading, setLoading] = useState(true);
  const setDuration = useTimerStore((s) => s.setDuration);

  const fetchRecipes = () => {
    fetch("/api/recipes")
      .then((r) => r.json())
      .then(setRecipes)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this recipe?")) return;
    await fetch(`/api/recipes/${id}`, { method: "DELETE" });
    fetchRecipes();
  };

  const startBrew = (recipe: RecipeWithBlend) => {
    setDuration(recipe.blend.brewTime ?? 300, recipe.name);
    window.location.href = "/timer";
  };

  return (
    <div>
      <DashboardHeader
        title="Saved Recipes"
        description="Your documented brewing rituals"
      />

      {loading ? (
        <LoadingSpinner />
      ) : recipes.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title="No recipes saved"
          description="Save a blend as a recipe to document your brewing process"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {recipes.map((recipe) => (
            <Card key={recipe.id} hover>
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                    {recipe.name}
                  </h3>
                  <Link
                    href={`/blends/${recipe.blend.id}`}
                    className="text-sm text-emerald-600 hover:underline dark:text-emerald-400"
                  >
                    {recipe.blend.name}
                  </Link>
                </div>
                {recipe.rating && (
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: recipe.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                )}
              </div>

              {recipe.notes && (
                <p className="mb-3 text-sm text-stone-500 dark:text-stone-400">
                  {recipe.notes}
                </p>
              )}

              <div className="mb-3 flex flex-wrap gap-1">
                {recipe.blend.ingredients.map((bi) => (
                  <CategoryBadge key={bi.id} category={bi.ingredient.category} />
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-stone-400">
                  Brewed {recipe.brewCount} times
                  {recipe.blend.brewTime && ` · ${formatTime(recipe.blend.brewTime)}`}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => startBrew(recipe)}>
                    <Timer className="h-3.5 w-3.5" />
                    Brew
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(recipe.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
