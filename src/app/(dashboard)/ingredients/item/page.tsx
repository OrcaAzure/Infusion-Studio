"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { IngredientDetailView } from "@/components/ingredients/ingredient-detail-view";
import { LoadingSpinner } from "@/components/ui/empty-state";

function IngredientItemContent() {
  const id = useSearchParams().get("id");
  if (!id) return <p>Ingredient not found</p>;
  return <IngredientDetailView id={id} />;
}

export default function IngredientItemPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <IngredientItemContent />
    </Suspense>
  );
}
