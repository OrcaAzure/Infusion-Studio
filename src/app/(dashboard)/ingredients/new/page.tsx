"use client";

import { Leaf } from "lucide-react";
import { DashboardHeader } from "@/components/layout/sidebar";
import { IngredientForm } from "@/components/ingredients/ingredient-form";
import { Card } from "@/components/ui/card";

export default function NewIngredientPage() {
  return (
    <div>
      <DashboardHeader
        icon={Leaf}
        title="Add Ingredient"
        description="Add a new item to your inventory"
      />
      <Card className="max-w-2xl">
        <IngredientForm />
      </Card>
    </div>
  );
}
