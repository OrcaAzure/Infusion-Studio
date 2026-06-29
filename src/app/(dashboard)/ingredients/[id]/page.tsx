"use client";

import { useParams } from "next/navigation";
import { IngredientDetailView } from "@/components/ingredients/ingredient-detail-view";

export default function IngredientDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <IngredientDetailView id={id} />;
}
