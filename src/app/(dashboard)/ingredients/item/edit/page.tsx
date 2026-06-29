"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Leaf } from "lucide-react";
import { DashboardHeader } from "@/components/layout/sidebar";
import { IngredientForm } from "@/components/ingredients/ingredient-form";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/empty-state";
import type { Ingredient } from "@prisma/client";

function EditIngredientContent() {
  const id = useSearchParams().get("id");
  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetch(`/api/ingredients/${id}`)
      .then((r) => r.json())
      .then(setIngredient)
      .finally(() => setLoading(false));
  }, [id]);

  if (!id) return <p>Ingredient not found</p>;
  if (loading) return <LoadingSpinner />;
  if (!ingredient) return <p>Ingredient not found</p>;

  return (
    <div>
      <DashboardHeader
        icon={Leaf}
        title={`Edit ${ingredient.name}`}
        description="Update ingredient details"
      />
      <Card className="max-w-2xl">
        <IngredientForm ingredient={ingredient} />
      </Card>
    </div>
  );
}

export default function EditIngredientItemPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <EditIngredientContent />
    </Suspense>
  );
}
