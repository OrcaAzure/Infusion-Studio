"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/layout/sidebar";
import { BlendCreator } from "@/components/blends/blend-creator";
import { LoadingSpinner } from "@/components/ui/empty-state";
import type { IngredientWithMeta } from "@/types";

export default function CreateBlendPage() {
  const [ingredients, setIngredients] = useState<IngredientWithMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ingredients")
      .then((r) => r.json())
      .then(setIngredients)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden">
      <DashboardHeader
        title="Blend Creator"
        description="Drag ingredients from the palette to craft your blend"
      />
      {loading ? <LoadingSpinner /> : <BlendCreator ingredients={ingredients} />}
    </div>
  );
}
