"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2, MapPin, Package } from "lucide-react";
import { DashboardHeader } from "@/components/layout/sidebar";
import { CategoryBadge, StatusBadge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/empty-state";
import { PairingSuggestions } from "@/components/ingredients/pairing-suggestions";
import { formatCurrency } from "@/lib/utils";
import { appPath } from "@/lib/app-path";
import type { IngredientWithMeta } from "@/types";

interface IngredientDetail extends IngredientWithMeta {
  blendItems: {
    blend: { id: string; name: string; createdAt: string };
  }[];
}

export default function IngredientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [ingredient, setIngredient] = useState<IngredientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/ingredients/${id}`)
      .then((r) => r.json())
      .then(setIngredient)
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this ingredient? It will be removed from all blends.")) return;
    await fetch(`/api/ingredients/${id}`, { method: "DELETE" });
    router.push(appPath("/ingredients"));
  };

  if (loading) return <LoadingSpinner />;
  if (!ingredient) return <p>Ingredient not found</p>;

  const isLowStock = ingredient.quantity <= 50;

  return (
    <div>
      <DashboardHeader
        title={ingredient.name}
        description={ingredient.description ?? undefined}
        action={
          <div className="flex gap-2">
            <Link href={`/ingredients/${id}/edit`}>
              <Button variant="outline">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <CategoryBadge category={ingredient.category} />
            {isLowStock && <StatusBadge variant="warning">Low stock</StatusBadge>}
            {ingredient.origin && (
              <span className="flex items-center gap-1 text-sm text-stone-500">
                <MapPin className="h-3.5 w-3.5" />
                {ingredient.origin}
              </span>
            )}
          </div>

          {Array.isArray(ingredient.flavorNotes) && ingredient.flavorNotes.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-medium text-stone-700 dark:text-stone-300">
                Flavor Profile
              </h3>
              <div className="flex flex-wrap gap-2">
                {(ingredient.flavorNotes as string[]).map((note) => (
                  <span
                    key={note}
                    className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-stone-50 p-4 dark:bg-stone-800">
              <div className="flex items-center gap-2 text-stone-500">
                <Package className="h-4 w-4" />
                <span className="text-xs">In Stock</span>
              </div>
              <p className="mt-1 text-xl font-bold text-stone-900 dark:text-stone-100">
                {ingredient.quantity} {ingredient.unit}
              </p>
            </div>
            {ingredient.pricePerUnit != null && (
              <div className="rounded-lg bg-stone-50 p-4 dark:bg-stone-800">
                <p className="text-xs text-stone-500">Price / unit</p>
                <p className="mt-1 text-xl font-bold text-stone-900 dark:text-stone-100">
                  {formatCurrency(ingredient.pricePerUnit)}
                </p>
              </div>
            )}
            {ingredient.pricePerUnit != null && (
              <div className="rounded-lg bg-stone-50 p-4 dark:bg-stone-800">
                <p className="text-xs text-stone-500">Total value</p>
                <p className="mt-1 text-xl font-bold text-stone-900 dark:text-stone-100">
                  {formatCurrency(ingredient.quantity * ingredient.pricePerUnit)}
                </p>
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <PairingSuggestions ingredientId={ingredient.id} ingredientName={ingredient.name} />

          <Card>
            <CardTitle className="mb-4">Used in Blends</CardTitle>
          {ingredient.blendItems?.length > 0 ? (
            <div className="space-y-2">
              {ingredient.blendItems.map(({ blend }) => (
                <Link
                  key={blend.id}
                  href={`/blends/${blend.id}`}
                  className="block rounded-lg border border-stone-200 p-3 text-sm transition-colors hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-800"
                >
                  {blend.name}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-500">Not used in any blends yet</p>
          )}
          </Card>
        </div>
      </div>
    </div>
  );
}
