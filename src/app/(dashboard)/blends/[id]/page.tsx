"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  Timer,
  BookOpen,
  Pencil,
  Trash2,
  Thermometer,
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/sidebar";
import { Card, CardTitle } from "@/components/ui/card";
import { CategoryBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/empty-state";
import { useTimerStore } from "@/stores";
import { formatTime } from "@/lib/utils";
import { appPath } from "@/lib/app-path";
import type { BlendWithIngredients } from "@/types";

interface BlendDetail extends BlendWithIngredients {
  favorites: { id: string }[];
  recipes: { id: string; name: string }[];
}

export default function BlendDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [blend, setBlend] = useState<BlendDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [recipeName, setRecipeName] = useState("");
  const [recipeNotes, setRecipeNotes] = useState("");
  const [savingRecipe, setSavingRecipe] = useState(false);

  const setDuration = useTimerStore((s) => s.setDuration);

  const fetchBlend = () => {
    fetch(`/api/blends/${id}`)
      .then((r) => r.json())
      .then((data: BlendDetail) => {
        setBlend(data);
        setIsFavorited(data.favorites.length > 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBlend();
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
    if (!confirm("Delete this blend?")) return;
    await fetch(`/api/blends/${id}`, { method: "DELETE" });
    router.push(appPath("/blends"));
  };

  const handleSaveRecipe = async () => {
    if (!recipeName.trim()) return;
    setSavingRecipe(true);
    const res = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: recipeName,
        notes: recipeNotes,
        blendId: id,
      }),
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
    setDuration(blend?.brewTime ?? 300, blend?.name ?? "");
    router.push(appPath("/timer"));
  };

  if (loading) return <LoadingSpinner />;
  if (!blend) return <p>Blend not found</p>;

  const totalAmount = blend.ingredients.reduce((sum, bi) => sum + bi.amount, 0);

  return (
    <div>
      <DashboardHeader
        title={blend.name}
        description={blend.description ?? undefined}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={toggleFavorite}>
              <Heart
                className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`}
              />
              {isFavorited ? "Favorited" : "Favorite"}
            </Button>
            <Button variant="outline" onClick={() => setShowRecipeModal(true)}>
              <BookOpen className="h-4 w-4" />
              Save recipe
            </Button>
            <Button onClick={startTimer}>
              <Timer className="h-4 w-4" />
              Brew
            </Button>
            <Link href={`/blends/${id}/edit`}>
              <Button variant="outline">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        }
      />

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

      <Card>
        <CardTitle className="mb-4">Ingredients</CardTitle>
        <div className="space-y-3">
          {blend.ingredients.map((bi, index) => (
            <div
              key={bi.id}
              className="flex items-center justify-between rounded-lg border border-stone-200 p-4 dark:border-stone-700"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  {index + 1}
                </span>
                <div>
                  <Link
                    href={`/ingredients/${bi.ingredient.id}`}
                    className="font-medium text-stone-900 hover:text-emerald-600 dark:text-stone-100"
                  >
                    {bi.ingredient.name}
                  </Link>
                  <div className="mt-0.5">
                    <CategoryBadge category={bi.ingredient.category} />
                  </div>
                </div>
              </div>
              <span className="font-medium text-stone-700 dark:text-stone-300">
                {bi.amount} {bi.unit}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Modal
        isOpen={showRecipeModal}
        onClose={() => setShowRecipeModal(false)}
        title="Save as Recipe"
      >
        <div className="space-y-4">
          <Input
            label="Recipe name"
            placeholder="My morning ritual"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
          />
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
    </div>
  );
}
