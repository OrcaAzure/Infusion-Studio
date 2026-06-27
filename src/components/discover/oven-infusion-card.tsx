"use client";

import { motion } from "framer-motion";
import { Star, Instagram } from "lucide-react";
import { CategoryBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatTime, GLOW_COLORS } from "@/lib/utils";
import type { SharedRecipe } from "@/types";

interface OvenInfusionCardProps {
  recipe: SharedRecipe;
  featured?: boolean;
}

/** Instagram-style recipe share card for @oven_infusion */
export function OvenInfusionCard({ recipe, featured }: OvenInfusionCardProps) {
  const handle = recipe.user.socialHandle ?? "oven_infusion";
  const title = recipe.shareTitle ?? recipe.name;
  const dominantCategory = recipe.blend.ingredients[0]?.ingredient.category ?? "TEA";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        hover
        data-glow-color={GLOW_COLORS[dominantCategory]}
        className="overflow-hidden p-0"
      >
        {/* IG-style header gradient */}
        <div
          className="relative h-28 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-4"
          data-glow-color={GLOW_COLORS[dominantCategory]}
        >
          {featured && (
            <span className="absolute right-3 top-3 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
              Recommended
            </span>
          )}
          <div className="flex items-center gap-2 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Instagram className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">@{handle}</p>
              <p className="text-xs text-white/80">oven infusion</p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <h3 className="mb-1 text-lg font-bold text-stone-900 dark:text-stone-100">
            {title}
          </h3>
          <p className="mb-3 text-sm text-emerald-600 dark:text-emerald-400">
            {recipe.blend.name}
          </p>

          {recipe.notes && (
            <p className="mb-3 line-clamp-2 text-sm text-stone-500 dark:text-stone-400">
              {recipe.notes}
            </p>
          )}

          <div className="mb-3 flex flex-wrap gap-1">
            {recipe.blend.ingredients.map((bi) => (
              <CategoryBadge key={bi.id} category={bi.ingredient.category} />
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-stone-100 pt-3 dark:border-stone-800">
            <div className="flex items-center gap-3 text-xs text-stone-400">
              {recipe.rating && (
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: recipe.rating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ))}
                </span>
              )}
              {recipe.blend.brewTime && (
                <span>{formatTime(recipe.blend.brewTime)} brew</span>
              )}
            </div>
            <span className="text-xs text-stone-400">
              {recipe.brewCount} brews
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
