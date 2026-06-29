"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, ArrowLeftRight } from "lucide-react";
import { CategoryBadge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  alternateUnit,
  convertAmount,
  isConvertibleUnit,
  unitHint,
  type ConvertibleUnit,
} from "@/lib/unit-convert";
import type { BlendCanvasItem } from "@/types";

interface CanvasItemProps {
  item: BlendCanvasItem;
  onAmountChange: (ingredientId: string, amount: number) => void;
  onRemove: (ingredientId: string) => void;
}

/** Canvas item — sortable blend ingredient with amount control */
export function CanvasItem({ item, onAmountChange, onRemove }: CanvasItemProps) {
  const [displayUnit, setDisplayUnit] = useState(item.unit);
  const alt = alternateUnit(item.unit);
  const showConverter = alt !== null && isConvertibleUnit(item.unit);

  const displayAmount =
    showConverter && displayUnit !== item.unit && isConvertibleUnit(displayUnit)
      ? convertAmount(item.amount, item.unit as ConvertibleUnit, displayUnit)
      : item.amount;

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
    ...(isDragging ? { touchAction: "none" as const } : {}),
  };

  const toggleUnit = () => {
    if (!alt) return;
    setDisplayUnit(displayUnit === item.unit ? alt : item.unit);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "w-full min-w-0 max-w-full overflow-hidden rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20",
        isDragging && "relative z-10 opacity-60 shadow-lg"
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 shrink-0 cursor-grab touch-none text-stone-400 hover:text-stone-600 active:cursor-grabbing"
          aria-label={`Reorder ${item.name}`}
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-stone-900 dark:text-stone-100">
            {item.name}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <CategoryBadge category={item.category} />
            {item.flavorNotes.length > 0 && (
              <span className="min-w-0 truncate text-xs text-stone-500">
                {item.flavorNotes.join(", ")}
              </span>
            )}
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => onRemove(item.ingredientId)}
          aria-label="Remove ingredient"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 pl-6">
        <Input
          type="number"
          step="0.1"
          min="0.1"
          value={item.amount}
          onChange={(e) => onAmountChange(item.ingredientId, parseFloat(e.target.value) || 0)}
          className="h-9 w-20 max-w-full shrink-0 text-center"
        />
        <span className="text-sm text-stone-500">{item.unit}</span>
        {showConverter && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1 px-2 text-xs"
              onClick={toggleUnit}
              title={unitHint(item.unit, displayUnit === item.unit ? alt! : item.unit)}
            >
              <ArrowLeftRight className="h-3 w-3" />
              ≈ {displayAmount} {displayUnit}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
