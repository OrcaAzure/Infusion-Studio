"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  emptyMessage?: string;
  isEmpty?: boolean;
}

/** Droppable target area for drag-and-drop operations */
export function DropZone({ id, children, className, emptyMessage, isEmpty }: DropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        className,
        isOver && "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30"
      )}
    >
      {children}
      {isEmpty && emptyMessage && (
        <div className="flex h-32 items-center justify-center text-sm text-stone-400">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}
