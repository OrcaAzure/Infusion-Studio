"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Package, ArrowRight } from "lucide-react";
import { CategoryBadge, StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { parseFlavorNotes } from "@/lib/utils";
import type { IngredientWithMeta } from "@/types";

interface IngredientCardProps {
  ingredient: IngredientWithMeta;
  index?: number;
}

export function IngredientCard({ ingredient, index = 0 }: IngredientCardProps) {
  const isLowStock = ingredient.quantity <= 50;

  const notes = parseFlavorNotes(ingredient.flavorNotes);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/ingredients/${ingredient.id}`}>
        <Card hover className="group h-full">
          <div className="mb-3 flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Package className="h-5 w-5" />
            </div>
            <CategoryBadge category={ingredient.category} />
          </div>

          <h3 className="mb-1 font-semibold text-stone-900 group-hover:text-emerald-600 dark:text-stone-100 dark:group-hover:text-emerald-400">
            {ingredient.name}
          </h3>

          {ingredient.description && (
            <p className="mb-3 line-clamp-2 text-sm text-stone-500 dark:text-stone-400">
              {ingredient.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                {ingredient.quantity} {ingredient.unit}
              </span>
              {isLowStock && <StatusBadge variant="warning">Low stock</StatusBadge>}
            </div>
            <ArrowRight className="h-4 w-4 text-stone-400 transition-transform group-hover:translate-x-1" />
          </div>

          {notes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {notes.slice(0, 3).map((note) => (
                <span
                  key={note}
                  className="rounded-md bg-stone-100 px-2 py-0.5 text-xs text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                >
                  {note}
                </span>
              ))}
            </div>
          )}
        </Card>
      </Link>
    </motion.div>
  );
}
