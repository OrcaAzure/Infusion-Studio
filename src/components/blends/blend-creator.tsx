"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  pointerWithin,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { ArrowLeft, FlaskConical, Save, RotateCcw } from "lucide-react";
import { useBlendStore } from "@/stores";
import { useDndSensors } from "@/hooks/use-dnd-sensors";
import { DraggableIngredient } from "./draggable-ingredient";
import { CanvasItem } from "./canvas-item";
import { DropZone } from "./drop-zone";
import { StepperInput } from "@/components/ui/stepper-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { AppLink } from "@/components/ui/app-link";
import { useToast } from "@/components/ui/toast";
import { parseFlavorNotes } from "@/lib/utils";
import { blendPath } from "@/lib/entity-path";
import { BlendPairingHints } from "./blend-pairing-hints";
import type { IngredientWithMeta } from "@/types";

const NAME_MAX = 100;
const DESC_MAX = 500;

interface BlendCreatorProps {
  ingredients: IngredientWithMeta[];
  editBlendId?: string;
}

export function BlendCreator({ ingredients, editBlendId }: BlendCreatorProps) {
  const router = useRouter();
  const toast = useToast((s) => s.show);
  const [activeIngredient, setActiveIngredient] = useState<IngredientWithMeta | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [tempUnit, setTempUnit] = useState<"C" | "F">("C");
  const [timeUnit, setTimeUnit] = useState<"sec" | "min">("sec");

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

  const sensors = useDndSensors();

  const canvasIds = items.map((i) => i.ingredientId);
  const usedIds = new Set(items.map((i) => i.ingredientId));
  const availableIngredients = ingredients.filter((i) => !usedIds.has(i.id));
  const anchorId = items.length > 0 ? items[items.length - 1].ingredientId : null;

  const nameError =
    name.length > NAME_MAX ? `Name must be ${NAME_MAX} characters or less` : "";
  const descError =
    description.length > DESC_MAX ? `Description must be ${DESC_MAX} characters or less` : "";

  const displayTemp =
    tempUnit === "C" ? brewTemp : Math.round((brewTemp * 9) / 5 + 32);
  const setDisplayTemp = (v: number) => {
    setBrewTemp(tempUnit === "C" ? v : Math.round(((v - 32) * 5) / 9));
  };

  const displayTime = timeUnit === "sec" ? brewTime : Math.round(brewTime / 60);
  const setDisplayTime = (v: number) => {
    setBrewTime(timeUnit === "sec" ? v : v * 60);
  };

  const addIngredientToCanvas = (ing: IngredientWithMeta) => {
    if (usedIds.has(ing.id)) return;
    addItem({
      ingredientId: ing.id,
      name: ing.name,
      category: ing.category,
      amount: 2,
      unit: ing.unit,
      order: items.length,
      flavorNotes: parseFlavorNotes(ing.flavorNotes),
    });
  };

  const collisionDetection: CollisionDetection = (args) => {
    const pointerHits = pointerWithin(args);
    if (pointerHits.length > 0) return pointerHits;
    return closestCenter(args);
  };

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

    if (activeData?.source === "palette") {
      const ing = activeData.ingredient as IngredientWithMeta;
      const droppedOnCanvas =
        over.id === "blend-canvas" || canvasIds.includes(over.id as string);
      if (!usedIds.has(ing.id) && droppedOnCanvas) {
        addIngredientToCanvas(ing);
      }
      return;
    }

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
    if (nameError || descError) {
      setError(nameError || descError);
      return;
    }
    if (items.length === 0) {
      setError("Add at least one ingredient");
      return;
    }

    setIsSaving(true);
    setError("");

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
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
      const msg = res.status === 401 ? "Please sign in to save blends" : "Failed to save blend";
      setError(msg);
      toast(msg);
      return;
    }

    const blend = await res.json();
    reset();
    router.push(blendPath(blend.id));
  };

  const handleReset = () => {
    if (items.length > 0 || name.trim() || description.trim()) {
      setShowResetModal(true);
      return;
    }
    reset();
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="mb-6 space-y-3">
        <div>
          <Input
            placeholder="Blend name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={NAME_MAX + 10}
          />
          <div className="mt-1 flex justify-between text-xs">
            {nameError ? (
              <span className="text-red-500">{nameError}</span>
            ) : (
              <span />
            )}
            <span className={name.length > NAME_MAX ? "text-red-500" : "text-stone-400"}>
              {name.length}/{NAME_MAX}
            </span>
          </div>
        </div>
        <div>
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            maxLength={DESC_MAX + 10}
          />
          <div className="mt-1 flex justify-between text-xs">
            {descError ? (
              <span className="text-red-500">{descError}</span>
            ) : (
              <span />
            )}
            <span className={description.length > DESC_MAX ? "text-red-500" : "text-stone-400"}>
              {description.length}/{DESC_MAX}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                Brew temp
              </span>
              <div className="flex rounded-lg border border-stone-200 p-0.5 dark:border-stone-700">
                {(["C", "F"] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                      tempUnit === u
                        ? "bg-emerald-600 text-white"
                        : "text-stone-500"
                    }`}
                    onClick={() => setTempUnit(u)}
                  >
                    °{u}
                  </button>
                ))}
              </div>
            </div>
            <StepperInput
              value={displayTemp}
              onChange={setDisplayTemp}
              min={tempUnit === "C" ? 40 : 104}
              max={tempUnit === "C" ? 100 : 212}
              step={tempUnit === "C" ? 5 : 9}
              unit={`°${tempUnit}`}
            />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                Brew time
              </span>
              <div className="flex rounded-lg border border-stone-200 p-0.5 dark:border-stone-700">
                {(["sec", "min"] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                      timeUnit === u
                        ? "bg-emerald-600 text-white"
                        : "text-stone-500"
                    }`}
                    onClick={() => setTimeUnit(u)}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
            <StepperInput
              value={displayTime}
              onChange={setDisplayTime}
              min={timeUnit === "sec" ? 30 : 1}
              max={timeUnit === "sec" ? 3600 : 60}
              step={timeUnit === "sec" ? 30 : 1}
              unit={timeUnit}
            />
          </div>
        </div>
      </div>

      <div className="grid w-full min-w-0 max-w-full gap-6 overflow-x-hidden lg:grid-cols-2">
        <Card className="min-w-0 overflow-hidden p-4 sm:p-6">
          <CardTitle className="mb-4">Ingredient Palette</CardTitle>
          <BlendPairingHints anchorId={anchorId} available={availableIngredients} />
          <div className="max-h-[min(500px,50vh)] space-y-2 overflow-y-auto overflow-x-hidden overscroll-contain">
            {ingredients.map((ing) => (
              <DraggableIngredient
                key={ing.id}
                ingredient={ing}
                isInCanvas={usedIds.has(ing.id)}
                onQuickAdd={addIngredientToCanvas}
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

        <div className="min-w-0 space-y-4">
          <Card className="min-w-0 overflow-hidden p-4 sm:p-6">
            <CardTitle className="mb-3">Blend Canvas</CardTitle>
            <DropZone
              id="blend-canvas"
              className="min-h-[200px] rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50/30 p-3 transition-colors dark:border-emerald-700 dark:bg-emerald-900/10"
              isEmpty={items.length === 0}
              emptyMessage="Drag here or tap + on an ingredient to add"
            >
              <SortableContext items={canvasIds} strategy={verticalListSortingStrategy}>
                <div className="w-full min-w-0 space-y-2 overflow-hidden">
                  {items.map((item) => (
                    <CanvasItem
                      key={item.ingredientId}
                      item={item}
                      onAmountChange={updateItemAmount}
                      onRemove={removeItem}
                    />
                  ))}
                </div>
              </SortableContext>
            </DropZone>
          </Card>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button onClick={handleSave} isLoading={isSaving} className="w-full sm:w-auto">
              <Save className="h-4 w-4" />
              {editBlendId ? "Update blend" : "Save blend"}
            </Button>
            <AppLink href="/blends" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </AppLink>
            <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showResetModal}
        title="Reset blend?"
        message="This will clear the canvas and all blend details. This cannot be undone."
        confirmLabel="Reset"
        variant="danger"
        onCancel={() => setShowResetModal(false)}
        onConfirm={() => {
          reset();
          setShowResetModal(false);
        }}
      />

      <DragOverlay dropAnimation={null}>
        {activeIngredient && (
          <div className="max-w-[min(100vw-2rem,20rem)] rounded-lg border border-emerald-300 bg-white p-3 shadow-xl dark:bg-stone-800">
            <p className="truncate font-medium">{activeIngredient.name}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
