"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { FlaskConical, Save, RotateCcw } from "lucide-react";
import { useBlendStore } from "@/stores";
import { DraggableIngredient } from "./draggable-ingredient";
import { CanvasItem } from "./canvas-item";
import { DropZone } from "./drop-zone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { IngredientWithMeta } from "@/types";

interface BlendCreatorProps {
  ingredients: IngredientWithMeta[];
  editBlendId?: string;
}

export function BlendCreator({ ingredients, editBlendId }: BlendCreatorProps) {
  const router = useRouter();
  const [activeIngredient, setActiveIngredient] = useState<IngredientWithMeta | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const {
    name,
    description,
    brewTemp,
    brewTime,
    items,
    setName,
    setDescription,
    setBrewTemp,
    setBrewTime,
    addItem,
    removeItem,
    updateItemAmount,
    reorderItems,
    reset,
  } = useBlendStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const canvasIds = items.map((i) => i.ingredientId);
  const usedIds = new Set(items.map((i) => i.ingredientId));

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.ingredient) {
      setActiveIngredient(data.ingredient as IngredientWithMeta);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveIngredient(null);
    const { active, over } = event;

    if (!over) return;

    const activeData = active.data.current;

    // Drop from palette onto canvas (or onto an existing canvas item)
    if (activeData?.source === "palette") {
      const ing = activeData.ingredient as IngredientWithMeta;
      const droppedOnCanvas =
        over.id === "blend-canvas" || canvasIds.includes(over.id as string);
      if (!usedIds.has(ing.id) && droppedOnCanvas) {
        addItem({
          ingredientId: ing.id,
          name: ing.name,
          category: ing.category,
          amount: 2,
          unit: ing.unit,
          order: items.length,
          flavorNotes: ing.flavorNotes,
        });
      }
      return;
    }

    // Reorder within canvas
    if (active.id !== over.id && canvasIds.includes(active.id as string)) {
      const oldIndex = canvasIds.indexOf(active.id as string);
      const newIndex = canvasIds.indexOf(over.id as string);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderItems(arrayMove(items, oldIndex, newIndex));
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Please name your blend");
      return;
    }
    if (items.length === 0) {
      setError("Add at least one ingredient");
      return;
    }

    setIsSaving(true);
    setError("");

    const payload = {
      name,
      description,
      brewTemp,
      brewTime,
      ingredients: items.map((item, index) => ({
        ingredientId: item.ingredientId,
        amount: item.amount,
        unit: item.unit,
        order: index,
      })),
    };

    const url = editBlendId ? `/api/blends/${editBlendId}` : "/api/blends";
    const method = editBlendId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setIsSaving(false);

    if (!res.ok) {
      setError("Failed to save blend");
      return;
    }

    const blend = await res.json();
    reset();
    router.push(`/blends/${blend.id}`);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ingredient palette */}
        <Card>
          <CardTitle className="mb-4">Ingredient Palette</CardTitle>
          <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1">
            {ingredients.map((ing) => (
              <DraggableIngredient
                key={ing.id}
                ingredient={ing}
                isInCanvas={usedIds.has(ing.id)}
              />
            ))}
            {ingredients.length === 0 && (
              <EmptyState
                icon={<FlaskConical className="h-6 w-6" />}
                title="No ingredients"
                description="Add ingredients to your inventory first"
              />
            )}
          </div>
        </Card>

        {/* Blend canvas */}
        <div className="space-y-4">
          <Card>
            <div className="mb-4 space-y-3">
              <Input
                placeholder="Blend name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Brew temp (°C)"
                  type="number"
                  value={brewTemp}
                  onChange={(e) => setBrewTemp(parseInt(e.target.value) || 90)}
                />
                <Input
                  label="Brew time (sec)"
                  type="number"
                  value={brewTime}
                  onChange={(e) => setBrewTime(parseInt(e.target.value) || 300)}
                />
              </div>
            </div>

            <CardTitle className="mb-3">Blend Canvas</CardTitle>
            <DropZone
              id="blend-canvas"
              className="min-h-[200px] space-y-2 rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50/30 p-3 transition-colors dark:border-emerald-700 dark:bg-emerald-900/10"
              isEmpty={items.length === 0}
              emptyMessage="Drag ingredients here to build your blend"
            >
              <SortableContext items={canvasIds} strategy={verticalListSortingStrategy}>
                {items.map((item) => (
                  <CanvasItem
                    key={item.ingredientId}
                    item={item}
                    onAmountChange={updateItemAmount}
                    onRemove={removeItem}
                  />
                ))}
              </SortableContext>
            </DropZone>
          </Card>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="flex gap-3">
            <Button onClick={handleSave} isLoading={isSaving}>
              <Save className="h-4 w-4" />
              {editBlendId ? "Update blend" : "Save blend"}
            </Button>
            <Button variant="outline" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeIngredient && (
          <div className="rounded-lg border border-emerald-300 bg-white p-3 shadow-xl dark:bg-stone-800">
            <p className="font-medium">{activeIngredient.name}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
