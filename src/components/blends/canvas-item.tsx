"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { CategoryBadge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BlendCanvasItem } from "@/types";

interface CanvasItemProps {
  item: BlendCanvasItem;
  onAmountChange: (ingredientId: string, amount: number) => void;
  onRemove: (ingredientId: string) => void;
}

/** Canvas item — sortable blend ingredient with amount control */
export function CanvasItem({ item, onAmountChange, onRemove }: CanvasItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.ingredientId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20",
        isDragging && "opacity-60 shadow-lg z-10"
      )}
    >
      <button
        className="cursor-grab touch-none text-stone-400 hover:text-stone-600"
        {...listeners}
        {...attributes}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-stone-900 dark:text-stone-100">{item.name}</p>
          <CategoryBadge category={item.category} />
        </div>
        {item.flavorNotes.length > 0 && (
          <p className="text-xs text-stone-500">{item.flavorNotes.join(", ")}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          step="0.1"
          min="0.1"
          value={item.amount}
          onChange={(e) => onAmountChange(item.ingredientId, parseFloat(e.target.value) || 0)}
          className="w-20 text-center"
        />
        <span className="text-sm text-stone-500">{item.unit}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(item.ingredientId)}
          aria-label="Remove ingredient"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
