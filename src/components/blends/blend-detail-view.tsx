"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AppLink } from "@/components/ui/app-link";
import {
  Heart,
  Timer,
  BookOpen,
  Pencil,
  Trash2,
  Thermometer,
  Download,
  Copy,
  GitBranch,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { CategoryBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { useTimerStore } from "@/stores";
import { formatTime } from "@/lib/utils";
import { appPath } from "@/lib/app-path";
import { blendEditPath, blendPath, ingredientPath } from "@/lib/entity-path";
import { recipeSchema } from "@/lib/validations/blend";
import { isOfflineDemo } from "@/lib/offline-demo/api";
import { cacheInvalidate } from "@/lib/client-cache";
import type { BlendWithIngredients } from "@/types";

type BlendDetail = BlendWithIngredients & {
  favorites: { id: string }[];
  recipes: { id: string; name: string }[];
};

export function BlendDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { status } = useSession();
  const toast = useToast((s) => s.show);
  const [blend, setBlend] = useState<BlendDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versionNotes, setVersionNotes] = useState("");
  const [savingVersion, setSavingVersion] = useState(false);
  const [recipeName, setRecipeName] = useState("");
  const [recipeNotes, setRecipeNotes] = useState("");
  const [recipeError, setRecipeError] = useState("");
  const [savingRecipe, setSavingRecipe] = useState(false);

  const setDuration = useTimerStore((s) => s.setDuration);

  const fetchBlend = () => {
    if (!id) return;
    fetch(`/api/blends/${id}`)
      .then((r) => {
        if (r.status === 401) {
          toast("Session expired, please sign in");
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
    if (!id) return;
    if (!isOfflineDemo() && status === "loading") return;
    fetchBlend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, status]);

  if (!id) return <p>Blend not found</p>;

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

  const exportBlend = () => {
    if (!blend) return;
    const data = {
      name: blend.name,
      description: blend.description,
      version: blend.version,
      brewTemp: blend.brewTemp ? `${blend.brewTemp}°C` : null,
      brewTime: blend.brewTime ? formatTime(blend.brewTime) : null,
      ingredients: blend.ingredients.map((bi) => ({
        name: bi.ingredient.name,
        category: bi.ingredient.category,
        amount: bi.amount,
        unit: bi.unit,
      })),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${blend.name.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveNewVersion = async () => {
    if (!blend) return;
    setSavingVersion(true);
    const res = await fetch(`/api/blends/${id}/version`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versionNotes }),
    });
    setSavingVersion(false);
    setShowVersionModal(false);
    setVersionNotes("");
    if (res.ok) {
      cacheInvalidate("blends");
      const created = await res.json();
      toast("New version saved");
      router.push(blendPath(created.id));
    } else {
      toast("Failed to save version");
    }
  };

  const duplicateBlend = async () => {
    if (!blend) return;
    const res = await fetch("/api/blends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `Copy of ${blend.name}`,
        description: blend.description,
        brewTemp: blend.brewTemp,
        brewTime: blend.brewTime,
        ingredients: blend.ingredients.map((bi, i) => ({
          ingredientId: bi.ingredientId,
          amount: bi.amount,
          unit: bi.unit,
          order: i,
        })),
      }),
    });
    setShowDuplicateModal(false);
    if (res.ok) {
      const newBlend = await res.json();
      router.push(blendPath(newBlend.id));
    } else {
      toast("Failed to duplicate blend");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!blend) return <p>Blend not found</p>;

  const unitTotals = blend.ingredients.reduce(
    (acc, bi) => {
      acc[bi.unit] = (acc[bi.unit] ?? 0) + bi.amount;
      return acc;
    },
    {} as Record<string, number>
  );
  const totalLabel = Object.entries(unitTotals)
    .map(([unit, total]) => `${total.toFixed(1)} ${unit}`)
    .join(" · ");

  return (
    <div>
      <div className="mb-6 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="page-header-pt min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-stone-900 sm:text-2xl dark:text-stone-100">
                  {blend.name}
                </h1>
                {blend.version && blend.version > 1 && (
                  <span className="alchemy-label rounded-full border border-current px-2 py-0.5 text-[10px] font-medium uppercase">
                    v{blend.version}
                  </span>
                )}
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
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={exportBlend}
            aria-label="Export blend"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => setShowVersionModal(true)}
            aria-label="Save as new version"
          >
            <GitBranch className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => setShowDuplicateModal(true)}
            aria-label="Duplicate blend"
          >
            <Copy className="h-4 w-4" />
          </Button>
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
          Total: {totalLabel}
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

          <Button size="lg" className="w-full sm:w-auto" onClick={startTimer} data-testid="blend-start-timer">
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

      <Modal
        isOpen={showVersionModal}
        onClose={() => setShowVersionModal(false)}
        title="Save as new version"
      >
        <p className="mb-4 text-sm text-stone-500">
          Creates the next version in this blend&apos;s lineage — ingredients and brew settings are
          copied.
        </p>
        <Textarea
          label="Version notes"
          placeholder="What changed in this version?"
          value={versionNotes}
          onChange={(e) => setVersionNotes(e.target.value)}
          rows={3}
          className="mb-4"
        />
        <Button onClick={saveNewVersion} isLoading={savingVersion} className="w-full">
          Save version
        </Button>
      </Modal>

      <ConfirmModal
        isOpen={showDuplicateModal}
        title="Duplicate blend?"
        message={`Creates a copy named "Copy of ${blend?.name}"`}
        confirmLabel="Duplicate"
        variant="default"
        onCancel={() => setShowDuplicateModal(false)}
        onConfirm={duplicateBlend}
      />
    </div>
  );
}
