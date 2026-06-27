"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus } from "lucide-react";
import { CategoryBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { IngredientWithMeta } from "@/types";

interface DraggableIngredientProps {
  ingredient: IngredientWithMeta;
  isInCanvas?: boolean;
  onQuickAdd?: (ingredient: IngredientWithMeta) => void;
}

/** Palette item — draggable source for the blend canvas */
export function DraggableIngredient({
  ingredient,
  isInCanvas,
  onQuickAdd,
}: DraggableIngredientProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${ingredient.id}`,
    data: { ingredient, source: "palette" },
    disabled: isInCanvas,
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform), touchAction: "none" as const }
    : { touchAction: "none" as const };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-3 transition-shadow dark:border-stone-700 dark:bg-stone-800",
        isDragging && "opacity-50 shadow-lg",
        isInCanvas && "cursor-not-allowed opacity-40",
        !isInCanvas && "cursor-grab active:cursor-grabbing hover:shadow-md"
      )}
      {...listeners}
      {...attributes}
    >
      <GripVertical className="h-4 w-4 shrink-0 touch-none text-stone-400" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-stone-900 dark:text-stone-100">
          {ingredient.name}
        </p>
        <p className="text-xs text-stone-500">
          {ingredient.quantity} {ingredient.unit} available
        </p>
      </div>
      <CategoryBadge category={ingredient.category} />
      {!isInCanvas && onQuickAdd && (
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-8 w-8 shrink-0 touch-manipulation"
          aria-label={`Add ${ingredient.name} to blend`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onQuickAdd(ingredient);
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
