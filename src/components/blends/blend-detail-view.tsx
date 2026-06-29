"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLink } from "@/components/ui/app-link";
import {
  Heart,
  Timer,
  BookOpen,
  Pencil,
  Trash2,
  Thermometer,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { CategoryBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/empty-state";
import { useTimerStore } from "@/stores";
import { formatTime } from "@/lib/utils";
import { appPath } from "@/lib/app-path";
import { blendEditPath, ingredientPath } from "@/lib/entity-path";
import { recipeSchema } from "@/lib/validations/blend";
import type { BlendWithIngredients } from "@/types";

interface BlendDetail extends BlendWithIngredients {
  favorites: { id: string }[];
  recipes: { id: string; name: string }[];
}

export function BlendDetailView({ id }: { id: string }) {
  const router = useRouter();
  const [blend, setBlend] = useState<BlendDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recipeName, setRecipeName] = useState("");
  const [recipeNotes, setRecipeNotes] = useState("");
  const [recipeError, setRecipeError] = useState("");
  const [savingRecipe, setSavingRecipe] = useState(false);

  const setDuration = useTimerStore((s) => s.setDuration);

  const fetchBlend = () => {
    fetch(`/api/blends/${id}`)
      .then((r) => {
        if (r.status === 401) {
          router.push(appPath("/login"));
          return null;
        }
        return r.json();
      })
      .then((data: BlendDetail | null) => {
        if (!data?.id) return;
        setBlend(data);
        setIsFavorited(data.favorites.length > 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBlend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const toggleFavorite = async () => {
    if (isFavorited) {
      await fetch(`/api/favorites/${id}`, { method: "DELETE" });
      setIsFavorited(false);
    } else {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blendId: id }),
      });
      setIsFavorited(true);
    }
  };

  const handleDelete = async () => {
    await fetch(`/api/blends/${id}`, { method: "DELETE" });
    router.push(appPath("/blends"));
  };

  const handleSaveRecipe = async () => {
    setRecipeError("");
    const parsed = recipeSchema.safeParse({
      name: recipeName.trim(),
      notes: recipeNotes.trim() || undefined,
      blendId: id,
    });
    if (!parsed.success) {
      const nameErr = parsed.error.flatten().fieldErrors.name?.[0];
      setRecipeError(nameErr ?? "Invalid recipe details");
      return;
    }

    setSavingRecipe(true);
    const res = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    setSavingRecipe(false);
    if (res.ok) {
      setShowRecipeModal(false);
      setRecipeName("");
      setRecipeNotes("");
      fetchBlend();
    }
  };

  const startTimer = () => {
    setDuration(blend?.brewTime ?? 300, blend?.name ?? "", { blendId: id });
    router.push(appPath("/timer"));
  };

  if (loading) return <LoadingSpinner />;
  if (!blend) return <p>Blend not found</p>;

  const totalAmount = blend.ingredients.reduce((sum, bi) => sum + bi.amount, 0);

  return (
    <div>
      <div className="mb-6 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div
          className="min-w-0 flex-1"
          style={{ paddingTop: "max(1.75rem, calc(env(safe-area-inset-top) + 1.25rem))" }}
        >
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-stone-900 sm:text-2xl dark:text-stone-100">
                  {blend.name}
                </h1>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={toggleFavorite}
                    aria-label={isFavorited ? "Unfavorite" : "Favorite"}
                  >
                    <Heart
                      className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`}
                    />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setShowRecipeModal(true)}
                    aria-label="Save as recipe"
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {blend.description && (
                <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                  {blend.description}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <AppLink href={blendEditPath(id)}>
            <Button variant="outline" size="icon" className="h-9 w-9" aria-label="Edit blend">
              <Pencil className="h-4 w-4" />
            </Button>
          </AppLink>
          <Button
            variant="destructive"
            size="icon"
            className="h-9 w-9"
            onClick={() => setShowDeleteModal(true)}
            aria-label="Delete blend"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        {blend.brewTemp && (
          <div className="flex items-center gap-2 rounded-lg bg-stone-100 px-4 py-2 text-sm dark:bg-stone-800">
            <Thermometer className="h-4 w-4 text-emerald-600" />
            {blend.brewTemp}°C
          </div>
        )}
        {blend.brewTime && (
          <div className="flex items-center gap-2 rounded-lg bg-stone-100 px-4 py-2 text-sm dark:bg-stone-800">
            <Timer className="h-4 w-4 text-emerald-600" />
            {formatTime(blend.brewTime)}
          </div>
        )}
        <div className="rounded-lg bg-stone-100 px-4 py-2 text-sm dark:bg-stone-800">
          Total: {totalAmount.toFixed(1)}g
        </div>
      </div>

      <Card className="mb-6">
        <CardTitle className="mb-4">Ingredients</CardTitle>
        <div className="space-y-3">
          {blend.ingredients.map((bi, index) => (
            <div
              key={bi.id}
              className="flex items-center justify-between rounded-lg border border-stone-200 p-4 dark:border-stone-700"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <AppLink
                    href={ingredientPath(bi.ingredient.id)}
                    className="truncate font-medium text-stone-900 hover:text-emerald-600 dark:text-stone-100"
                  >
                    {bi.ingredient.name}
                  </AppLink>
                  <div className="mt-0.5">
                    <CategoryBadge category={bi.ingredient.category} />
                  </div>
                </div>
              </div>
              <span className="shrink-0 font-medium text-stone-700 dark:text-stone-300">
                {bi.amount} {bi.unit}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Button size="lg" className="w-full sm:w-auto" onClick={startTimer}>
        <Timer className="h-5 w-5" />
        Start brew timer
      </Button>

      <Modal
        isOpen={showRecipeModal}
        onClose={() => {
          setShowRecipeModal(false);
          setRecipeError("");
        }}
        title="Save as Recipe"
      >
        <div className="space-y-4">
          <div>
            <Input
              label="Recipe name"
              placeholder="My morning ritual"
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              maxLength={120}
            />
            <p className="mt-1 text-right text-xs text-stone-400">
              {recipeName.length}/100
            </p>
          </div>
          {recipeError && <p className="text-sm text-red-500">{recipeError}</p>}
          <Textarea
            label="Brewing notes"
            placeholder="Steep covered for 5 minutes..."
            value={recipeNotes}
            onChange={(e) => setRecipeNotes(e.target.value)}
          />
          <Button onClick={handleSaveRecipe} isLoading={savingRecipe} className="w-full">
            Save recipe
          </Button>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete blend?"
        message="This will permanently delete this blend and cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
