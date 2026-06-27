"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, FlaskConical } from "lucide-react";
import { CategoryBadge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/empty-state";
import { GLOW_COLORS } from "@/lib/utils";
import type { PairingResult } from "@/lib/pairings";

interface PairingSuggestionsProps {
  ingredientId: string;
  ingredientName: string;
}

export function PairingSuggestions({ ingredientId, ingredientName }: PairingSuggestionsProps) {
  const [pairings, setPairings] = useState<PairingResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/ingredients/${ingredientId}/pairings`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPairings(data);
      })
      .finally(() => setLoading(false));
  }, [ingredientId]);

  if (loading) {
    return (
      <Card glowColor={GLOW_COLORS.FLOWER}>
        <CardTitle className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-600" />
          Pairs Well With
        </CardTitle>
        <LoadingSpinner className="py-6" />
      </Card>
    );
  }

  if (pairings.length === 0) {
    return (
      <Card glowColor={GLOW_COLORS.HERB}>
        <CardTitle className="mb-2 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-600" />
          Pairs Well With
        </CardTitle>
        <p className="text-sm text-stone-500">
          Add more ingredients to your inventory to get pairing suggestions for {ingredientName}.
        </p>
      </Card>
    );
  }

  return (
    <Card glowColor={GLOW_COLORS.FLOWER} className="relative overflow-hidden">
      {/* Decorative brew ripple */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-100/50 blur-2xl dark:bg-emerald-900/20" />

      <CardTitle className="mb-1 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-emerald-600" />
        Pairs Well With
      </CardTitle>
      <p className="mb-4 text-xs text-stone-500">
        Recommended partners for {ingredientName}
      </p>

      <div className="space-y-3">
        {pairings.map((pairing, i) => (
          <PairingRow key={pairing.ingredient.id} pairing={pairing} index={i} />
        ))}
      </div>

      <Link
        href="/blends/create"
        className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-dashed border-emerald-300 py-2.5 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
      >
        <FlaskConical className="h-4 w-4" />
        Blend these together
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </Card>
  );
}

function PairingRow({ pairing, index }: { pairing: PairingResult; index: number }) {
  const { ingredient, score, reasons } = pairing;
  const pct = Math.round(score * 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Link
        href={`/ingredients/${ingredient.id}`}
        className="group block rounded-lg border border-stone-200 p-3 transition-all hover:border-emerald-300 hover:shadow-sm dark:border-stone-700 dark:hover:border-emerald-700"
        data-glow-color={GLOW_COLORS[ingredient.category]}
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-stone-900 group-hover:text-emerald-600 dark:text-stone-100">
              {ingredient.name}
            </span>
            <CategoryBadge category={ingredient.category} />
          </div>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            {pct}% match
          </span>
        </div>

        {/* Compatibility bar */}
        <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          />
        </div>

        {reasons.length > 0 && (
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {reasons[0]}
          </p>
        )}
      </Link>
    </motion.div>
  );
}
