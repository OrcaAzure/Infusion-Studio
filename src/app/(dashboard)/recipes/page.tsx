"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Star, Trash2, Timer, Share2, Instagram, ChevronRight } from "lucide-react";
import { DashboardHeader } from "@/components/layout/sidebar";
import { ShareRecipeModal } from "@/components/discover/share-recipe-modal";
import { SignupCtaModal } from "@/components/providers/signup-cta-modal";
import { Card } from "@/components/ui/card";
import { CategoryBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { AppLink } from "@/components/ui/app-link";
import { LoadingSpinner, EmptyState } from "@/components/ui/empty-state";
import { useTimerStore } from "@/stores";
import { formatTime } from "@/lib/utils";
import { appPath } from "@/lib/app-path";
import { blendPath } from "@/lib/entity-path";
import { isOfflineDemo } from "@/lib/offline-demo/api";
import type { RecipeWithBlend, BrewLogEntry } from "@/types";

export default function RecipesPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<RecipeWithBlend[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareRecipe, setShareRecipe] = useState<RecipeWithBlend | null>(null);
  const [detailRecipe, setDetailRecipe] = useState<RecipeWithBlend | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showSignupCta, setShowSignupCta] = useState(false);
  const [socialHandle, setSocialHandle] = useState("oven_infusion");
  const [brewLogs, setBrewLogs] = useState<BrewLogEntry[]>([]);
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

  useEffect(() => {
    if (!detailRecipe) {
      setBrewLogs([]);
      return;
    }
    fetch(`/api/brew-logs?recipeId=${detailRecipe.id}`)
      .then((r) => r.json())
      .then((data) => setBrewLogs(Array.isArray(data) ? data : []));
  }, [detailRecipe]);

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/recipes/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    setDetailRecipe(null);
    fetchRecipes();
  };

  const startBrew = (recipe: RecipeWithBlend) => {
    setDuration(recipe.blend.brewTime ?? 300, recipe.name, {
      blendId: recipe.blend.id,
      recipeId: recipe.id,
    });
    router.push(appPath("/timer"));
  };

  const handleShare = (recipe: RecipeWithBlend) => {
    if (isOfflineDemo()) {
      setShowSignupCta(true);
      return;
    }
    setShareRecipe(recipe);
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
            <Card
              key={recipe.id}
              hover
              className="cursor-pointer"
              onClick={() => setDetailRecipe(recipe)}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold text-stone-900 dark:text-stone-100">
                      {recipe.shareTitle ?? recipe.name}
                    </h3>
                    {recipe.isShared && (
                      <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        Shared
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">{recipe.blend.name}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {recipe.rating ? (
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: recipe.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  ) : null}
                  <ChevronRight className="h-4 w-4 text-stone-400" />
                </div>
              </div>

              {recipe.notes && (
                <p className="mb-3 line-clamp-2 text-sm text-stone-500 dark:text-stone-400">
                  {recipe.notes}
                </p>
              )}

              <div className="text-xs text-stone-400">
                Brewed {recipe.brewCount} times
                {recipe.blend.brewTime && ` · ${formatTime(recipe.blend.brewTime)}`}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!detailRecipe}
        onClose={() => setDetailRecipe(null)}
        title={detailRecipe?.shareTitle ?? detailRecipe?.name ?? "Recipe"}
      >
        {detailRecipe && (
          <div className="space-y-4">
            <AppLink
              href={blendPath(detailRecipe.blend.id)}
              className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
            >
              {detailRecipe.blend.name}
            </AppLink>
            {detailRecipe.notes && (
              <p className="text-sm text-stone-600 dark:text-stone-400">{detailRecipe.notes}</p>
            )}
            <div className="flex flex-wrap gap-1">
              {detailRecipe.blend.ingredients.map((bi) => (
                <CategoryBadge key={bi.id} category={bi.ingredient.category} />
              ))}
            </div>
            <p className="text-xs text-stone-400">
              Brewed {detailRecipe.brewCount} times
              {detailRecipe.lastBrewed &&
                ` · Last: ${new Date(detailRecipe.lastBrewed).toLocaleDateString()}`}
            </p>

            {brewLogs.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-stone-700 dark:text-stone-300">
                  Brew history
                </h4>
                <ul className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-stone-200 p-3 dark:border-stone-700">
                  {brewLogs.map((log) => (
                    <li key={log.id} className="text-sm">
                      <span className="text-stone-500">
                        {new Date(log.brewedAt).toLocaleString()}
                      </span>
                      {log.notes && (
                        <p className="mt-0.5 text-stone-700 dark:text-stone-300">{log.notes}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => startBrew(detailRecipe)}>
                <Timer className="h-3.5 w-3.5" />
                Brew
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleShare(detailRecipe)}>
                <Share2 className="h-3.5 w-3.5" />
                Share
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDeleteId(detailRecipe.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {shareRecipe && (
        <ShareRecipeModal
          recipe={shareRecipe}
          socialHandle={socialHandle}
          isOpen={!!shareRecipe}
          onClose={() => setShareRecipe(null)}
          onShared={fetchRecipes}
        />
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete recipe?"
        message="This recipe will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />

      <SignupCtaModal isOpen={showSignupCta} onClose={() => setShowSignupCta(false)} />
    </div>
  );
}
