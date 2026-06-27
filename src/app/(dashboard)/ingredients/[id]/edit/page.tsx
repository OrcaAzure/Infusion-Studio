"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Leaf } from "lucide-react";
import { DashboardHeader } from "@/components/layout/sidebar";
import { IngredientForm } from "@/components/ingredients/ingredient-form";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/empty-state";
import type { Ingredient } from "@prisma/client";

export default function EditIngredientPage() {
  const { id } = useParams<{ id: string }>();
  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/ingredients/${id}`)
      .then((r) => r.json())
      .then(setIngredient)
      .finally(() => setLoading(false));
  }, [id]);

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
