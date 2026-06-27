"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { CategoryBadge } from "@/components/ui/badge";
import type { PairingResult } from "@/lib/pairings";
import type { IngredientWithMeta } from "@/types";

interface BlendPairingHintsProps {
  /** Ingredient currently on the canvas to base suggestions on */
  anchorId: string | null;
  /** Palette ingredients not yet in the blend */
  available: IngredientWithMeta[];
  onHighlight?: (id: string) => void;
}

/** Compact pairing hints while building a blend */
export function BlendPairingHints({ anchorId, available }: BlendPairingHintsProps) {
  const [pairings, setPairings] = useState<PairingResult[]>([]);

  useEffect(() => {
    if (!anchorId) {
      setPairings([]);
      return;
    }
    fetch(`/api/ingredients/${anchorId}/pairings`)
      .then((r) => r.json())
      .then((data: PairingResult[]) => {
        if (!Array.isArray(data)) return;
        const availableIds = new Set(available.map((i) => i.id));
        setPairings(data.filter((p) => availableIds.has(p.ingredient.id)).slice(0, 3));
      });
  }, [anchorId, available]);

  if (!anchorId || pairings.length === 0) return null;

  return (
    <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-800 dark:bg-emerald-900/20">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
        <Sparkles className="h-3.5 w-3.5" />
        Goes well with your blend
      </p>
      <div className="flex flex-wrap gap-2">
        {pairings.map((p) => (
          <span
            key={p.ingredient.id}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-xs dark:border-emerald-700 dark:bg-stone-900"
          >
            <span className="font-medium text-stone-800 dark:text-stone-200">
              {p.ingredient.name}
            </span>
            <CategoryBadge category={p.ingredient.category} />
            <span className="text-emerald-600 dark:text-emerald-400">
              {Math.round(p.score * 100)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
