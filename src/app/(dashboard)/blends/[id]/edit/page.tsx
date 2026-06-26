"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardHeader } from "@/components/layout/sidebar";
import { BlendCreator } from "@/components/blends/blend-creator";
import { LoadingSpinner } from "@/components/ui/empty-state";
import { useBlendStore } from "@/stores";
import type { IngredientWithMeta, BlendWithIngredients } from "@/types";

export default function EditBlendPage() {
  const { id } = useParams<{ id: string }>();
  const [ingredients, setIngredients] = useState<IngredientWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const loadBlend = useBlendStore((s) => s.loadBlend);

  useEffect(() => {
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
          flavorNotes: bi.ingredient.flavorNotes,
        })),
      });
      setLoading(false);
    });
  }, [id, loadBlend]);

  return (
    <div>
      <DashboardHeader
        title="Edit Blend"
        description="Modify your blend composition"
      />
      {loading ? <LoadingSpinner /> : <BlendCreator ingredients={ingredients} editBlendId={id} />}
    </div>
  );
}
