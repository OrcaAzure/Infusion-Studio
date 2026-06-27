"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Star, Trash2, Timer, Share2, Instagram } from "lucide-react";
import { DashboardHeader } from "@/components/layout/sidebar";
import { ShareRecipeModal } from "@/components/discover/share-recipe-modal";
import { Card } from "@/components/ui/card";
import { CategoryBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppLink } from "@/components/ui/app-link";
import { LoadingSpinner, EmptyState } from "@/components/ui/empty-state";
import { useTimerStore } from "@/stores";
import { formatTime } from "@/lib/utils";
import { appPath } from "@/lib/app-path";
import type { RecipeWithBlend } from "@/types";

export default function RecipesPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<RecipeWithBlend[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareRecipe, setShareRecipe] = useState<RecipeWithBlend | null>(null);
  const [socialHandle, setSocialHandle] = useState("oven_infusion");
  const setDuration = useTimerStore((s) => s.setDuration);

  const fetchRecipes = () => {
    fetch("/api/recipes")
      .then((r) => r.json())
      .then(setRecipes)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecipes();
    fetch("/api/profile")
      .then((r) => r.json())
      .then((p) => p?.socialHandle && setSocialHandle(p.socialHandle));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this recipe?")) return;
    await fetch(`/api/recipes/${id}`, { method: "DELETE" });
    fetchRecipes();
  };

  const startBrew = (recipe: RecipeWithBlend) => {
    setDuration(recipe.blend.brewTime ?? 300, recipe.name);
    router.push(appPath("/timer"));
  };

  return (
    <div>
      <DashboardHeader
        title="Saved Recipes"
        description="Your documented brewing rituals"
        action={
          <AppLink href="/oven-infusion">
            <Button variant="outline">
              <Instagram className="h-4 w-4" />
              Oven Infusion
            </Button>
          </AppLink>
        }
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
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                      {recipe.shareTitle ?? recipe.name}
                    </h3>
                    {recipe.isShared && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        Shared
                      </span>
                    )}
                  </div>
                  <AppLink
                    href={`/blends/${recipe.blend.id}`}
                    className="text-sm text-emerald-600 hover:underline dark:text-emerald-400"
                  >
                    {recipe.blend.name}
                  </AppLink>
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
                  <Button size="sm" variant="outline" onClick={() => setShareRecipe(recipe)}>
                    <Share2 className="h-3.5 w-3.5" />
                    Share
                  </Button>
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

      {shareRecipe && (
        <ShareRecipeModal
          recipe={shareRecipe}
          socialHandle={socialHandle}
          isOpen={!!shareRecipe}
          onClose={() => setShareRecipe(null)}
          onShared={fetchRecipes}
        />
      )}
    </div>
  );
}
