"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/layout/sidebar";
import { BlendCreator } from "@/components/blends/blend-creator";
import { LoadingSpinner } from "@/components/ui/empty-state";
import { useBlendStore } from "@/stores";
import type { IngredientWithMeta, BlendWithIngredients } from "@/types";

function EditBlendItemContent() {
  const id = useSearchParams().get("id");
  const [ingredients, setIngredients] = useState<IngredientWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const loadBlend = useBlendStore((s) => s.loadBlend);
  const savedRef = useRef(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetch("/api/ingredients").then((r) => r.json()),
      fetch(`/api/blends/${id}`).then((r) => r.json()),
    ]).then(([ings, blend]: [IngredientWithMeta[], BlendWithIngredients]) => {
      setIngredients(ings);
      loadBlend({
        name: blend.name,
        description: blend.description,
        brewTemp: blend.brewTemp,
        brewTime: blend.brewTime,
        items: blend.ingredients.map((bi) => ({
          ingredientId: bi.ingredientId,
          name: bi.ingredient.name,
          category: bi.ingredient.category,
          amount: bi.amount,
          unit: bi.unit,
          order: bi.order,
          flavorNotes: Array.isArray(bi.ingredient.flavorNotes)
            ? (bi.ingredient.flavorNotes as string[])
            : [],
        })),
      });
      setLoading(false);
    });

    return () => {
      if (!savedRef.current) {
        useBlendStore.getState().reset();
      }
    };
  }, [id, loadBlend]);

  if (!id) return <p>Blend not found</p>;

  return (
    <div>
      <DashboardHeader title="Edit Blend" description="Modify your blend composition" />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <BlendCreator
          ingredients={ingredients}
          editBlendId={id}
          onSaved={() => {
            savedRef.current = true;
          }}
        />
      )}
    </div>
  );
}

export default function EditBlendItemPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <EditBlendItemContent />
    </Suspense>
  );
}
