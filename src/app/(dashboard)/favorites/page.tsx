"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Timer } from "lucide-react";
import { DashboardHeader } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { CategoryBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner, EmptyState } from "@/components/ui/empty-state";
import { useTimerStore } from "@/stores";
import type { FavoriteWithBlend } from "@/types";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteWithBlend[]>([]);
  const [loading, setLoading] = useState(true);
  const setDuration = useTimerStore((s) => s.setDuration);

  const fetchFavorites = () => {
    fetch("/api/favorites")
      .then((r) => r.json())
      .then(setFavorites)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const removeFavorite = async (blendId: string) => {
    await fetch(`/api/favorites/${blendId}`, { method: "DELETE" });
    fetchFavorites();
  };

  const startBrew = (fav: FavoriteWithBlend) => {
    setDuration(fav.blend.brewTime ?? 300, fav.blend.name);
    window.location.href = "/timer";
  };

  return (
    <div>
      <DashboardHeader
        title="Favorite Blends"
        description="Your go-to infusion blends"
      />

      {loading ? (
        <LoadingSpinner />
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-6 w-6" />}
          title="No favorites yet"
          description="Heart a blend to add it to your favorites"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav) => (
            <Card key={fav.id} hover className="relative">
              <button
                onClick={() => removeFavorite(fav.blendId)}
                className="absolute right-4 top-4 text-red-500 hover:text-red-600"
                aria-label="Remove from favorites"
              >
                <Heart className="h-5 w-5 fill-current" />
              </button>

              <Link href={`/blends/${fav.blend.id}`}>
                <h3 className="mb-1 pr-8 font-semibold text-stone-900 dark:text-stone-100">
                  {fav.blend.name}
                </h3>
              </Link>

              {fav.blend.description && (
                <p className="mb-3 line-clamp-2 text-sm text-stone-500">
                  {fav.blend.description}
                </p>
              )}

              <div className="mb-4 flex flex-wrap gap-1">
                {fav.blend.ingredients.map((bi) => (
                  <CategoryBadge key={bi.id} category={bi.ingredient.category} />
                ))}
              </div>

              <Button size="sm" className="w-full" onClick={() => startBrew(fav)}>
                <Timer className="h-3.5 w-3.5" />
                Start brewing
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
