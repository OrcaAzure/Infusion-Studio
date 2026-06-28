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

function stopDragPropagation(e: React.SyntheticEvent) {
  e.stopPropagation();
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

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "w-full min-w-0 max-w-full overflow-hidden rounded-lg border border-stone-200 bg-white p-3 transition-shadow dark:border-stone-700 dark:bg-stone-800",
        isDragging && "relative z-10 opacity-50 shadow-lg",
        isInCanvas && "opacity-40",
        !isInCanvas && "hover:shadow-md"
      )}
    >
      <div className="flex items-start gap-2">
        {!isInCanvas ? (
          <button
            type="button"
            className="mt-0.5 shrink-0 cursor-grab touch-none text-stone-400 active:cursor-grabbing"
            aria-label={`Drag ${ingredient.name}`}
            {...listeners}
            {...attributes}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        ) : (
          <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-stone-300" />
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-stone-900 dark:text-stone-100">
            {ingredient.name}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-stone-500">
              {ingredient.quantity} {ingredient.unit}
            </span>
            <CategoryBadge category={ingredient.category} />
          </div>
        </div>

        {!isInCanvas && onQuickAdd && (
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-9 w-9 shrink-0 touch-manipulation"
            aria-label={`Add ${ingredient.name} to blend`}
            onPointerDown={stopDragPropagation}
            onTouchStart={stopDragPropagation}
            onMouseDown={stopDragPropagation}
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd(ingredient);
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
