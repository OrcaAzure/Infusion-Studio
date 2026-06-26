import { DashboardHeader } from "@/components/layout/sidebar";
import { IngredientForm } from "@/components/ingredients/ingredient-form";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Add Ingredient" };

export default function NewIngredientPage() {
  return (
    <div>
      <DashboardHeader
        title="Add Ingredient"
        description="Add a new item to your inventory"
      />
      <Card className="max-w-2xl">
        <IngredientForm />
      </Card>
    </div>
  );
}
