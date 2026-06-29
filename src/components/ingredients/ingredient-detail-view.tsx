"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLink } from "@/components/ui/app-link";
import { Pencil, Trash2, MapPin, Package, Leaf, Minus, Plus } from "lucide-react";
import { DashboardHeader } from "@/components/layout/sidebar";
import { CategoryBadge, StatusBadge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { NumberInput } from "@/components/ui/number-input";
import { LoadingSpinner } from "@/components/ui/empty-state";
import { PairingSuggestions } from "@/components/ingredients/pairing-suggestions";
import { formatCurrency } from "@/lib/utils";
import { appPath } from "@/lib/app-path";
import { ingredientEditPath, blendPath } from "@/lib/entity-path";
import type { IngredientWithMeta } from "@/types";

interface IngredientDetail extends IngredientWithMeta {
  blendItems: {
    blend: { id: string; name: string; createdAt: string };
  }[];
}

export function IngredientDetailView({ id }: { id: string }) {
  const router = useRouter();
  const [ingredient, setIngredient] = useState<IngredientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stockModal, setStockModal] = useState<"use" | "restock" | null>(null);
  const [stockDelta, setStockDelta] = useState(5);
  const [stockSaving, setStockSaving] = useState(false);

  const load = () => {
    fetch(`/api/ingredients/${id}`)
      .then((r) => {
        if (r.status === 401) {
          router.push(appPath("/login"));
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setIngredient(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = async () => {
    await fetch(`/api/ingredients/${id}`, { method: "DELETE" });
    router.push(appPath("/ingredients"));
  };

  const applyStock = async () => {
    if (!stockModal) return;
    setStockSaving(true);
    const delta = stockModal === "use" ? -Math.abs(stockDelta) : Math.abs(stockDelta);
    const res = await fetch(`/api/ingredients/${id}/stock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delta }),
    });
    setStockSaving(false);
    if (res.ok) {
      setStockModal(null);
      setLoading(true);
      load();
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!ingredient?.id) return <p>Ingredient not found</p>;

  const threshold = ingredient.lowStockThreshold ?? 50;
  const isLowStock = ingredient.quantity <= threshold;

  return (
    <div>
      <DashboardHeader
        icon={Leaf}
        title={ingredient.name}
        description={ingredient.description ?? undefined}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setStockModal("use")}>
              <Minus className="h-4 w-4" />
              Use some
            </Button>
            <Button variant="outline" size="sm" onClick={() => setStockModal("restock")}>
              <Plus className="h-4 w-4" />
              Restock
            </Button>
            <AppLink href={ingredientEditPath(id)}>
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </AppLink>
            <Button variant="destructive" size="sm" onClick={() => setShowDeleteModal(true)}>
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
                  <AppLink
                    key={blend.id}
                    href={blendPath(blend.id)}
                    className="block rounded-lg border border-stone-200 p-3 text-sm transition-colors hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-800"
                  >
                    {blend.name}
                  </AppLink>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone-500">Not used in any blends yet</p>
            )}
          </Card>
        </div>
      </div>

      <Modal
        isOpen={!!stockModal}
        onClose={() => setStockModal(null)}
        title={stockModal === "use" ? "Use some stock" : "Restock"}
      >
        <div className="space-y-4">
          <NumberInput
            label={`Amount (${ingredient.unit})`}
            value={stockDelta}
            onChange={setStockDelta}
            min={0.1}
            step={1}
          />
          <Button onClick={applyStock} isLoading={stockSaving} className="w-full">
            {stockModal === "use" ? "Remove from stock" : "Add to stock"}
          </Button>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete ingredient?"
        message="This ingredient will be removed from all blends. This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
