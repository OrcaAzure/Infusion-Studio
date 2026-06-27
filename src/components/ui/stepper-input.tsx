"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface StepperInputProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  className?: string;
}

export function StepperInput({
  label,
  value,
  onChange,
  min = 0,
  max = 99999,
  step = 1,
  unit,
  className,
}: StepperInputProps) {
  const dec = () => onChange(Math.max(min, Math.round((value - step) * 10) / 10));
  const inc = () => onChange(Math.min(max, Math.round((value + step) * 10) / 10));

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <span className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          {label}
        </span>
      )}
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="icon" onClick={dec} aria-label="Decrease">
          <Minus className="h-4 w-4" />
        </Button>
        <div className="flex min-w-[4.5rem] flex-1 items-center justify-center rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium tabular-nums dark:border-stone-600 dark:bg-stone-900">
          {value}
          {unit && <span className="ml-1 text-stone-500">{unit}</span>}
        </div>
        <Button type="button" variant="outline" size="icon" onClick={inc} aria-label="Increase">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
