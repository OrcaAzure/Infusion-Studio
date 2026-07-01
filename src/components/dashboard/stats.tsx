"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MotionItem, SOFT_EASE } from "@/components/ui/motion";
import { AppLink } from "@/components/ui/app-link";
import { type LucideIcon, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  className?: string;
  index?: number;
  href?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  index = 0,
  href,
}: StatCardProps) {
  const inner = (
    <Card
      hover={!!href}
      className={cn("relative overflow-hidden transition-shadow", href && "cursor-pointer", className)}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-stone-500 dark:text-stone-400">{title}</p>
          <p className="mt-1 max-w-full truncate text-3xl font-bold text-stone-900 dark:text-stone-100">
            {value}
          </p>
          {description && <p className="mt-1 text-xs text-stone-400">{description}</p>}
          {trend && (
            <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {trend}
            </p>
          )}
        </div>
        <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );

  return (
    <MotionItem index={index}>
      {href ? <AppLink href={href}>{inner}</AppLink> : inner}
    </MotionItem>
  );
}

interface CategoryChartProps {
  data: { category: string; count: number; key?: string }[];
}

const CHART_COLORS = [
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-indigo-500",
  "bg-violet-500",
];

export function CategoryChart({ data }: CategoryChartProps) {
  const [isTouch, setIsTouch] = useState(false);
  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;

  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  return (
    <div className="space-y-3">
      {data.map((item, i) => {
        const categoryKey = item.key ?? item.category;
        const bar = (
          <div key={item.category}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium text-stone-700 dark:text-stone-300">
                {item.category}
              </span>
              <span className="text-stone-500">{item.count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  CHART_COLORS[i % CHART_COLORS.length],
                  item.key && "cursor-pointer hover:opacity-80"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${(item.count / total) * 100}%` }}
                transition={{ duration: 0.45, delay: Math.min(i * 0.06, 0.24), ease: SOFT_EASE }}
              />
            </div>
          </div>
        );

        if (item.key) {
          return (
            <AppLink
              key={item.category}
              href={`/ingredients?category=${item.key}`}
              className="block rounded-lg transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/50"
            >
              {bar}
            </AppLink>
          );
        }
        return bar;
      })}
      {data.length === 0 && (
        <p className="text-center text-sm text-stone-400">No data yet</p>
      )}
      {data.length > 0 && (
        <p className="mt-2 text-center text-xs text-stone-400 dark:text-stone-500">
          <span className="inline-flex items-center gap-1">
            <Filter className="h-3 w-3" /> {isTouch ? "Tap" : "Click"} a category to filter
          </span>
        </p>
      )}
    </div>
  );
}

export function lowStockSeverity(quantity: number): "critical" | "warning" | "low" {
  if (quantity <= 10) return "critical";
  if (quantity <= 18) return "warning";
  return "low";
}

export const LOW_STOCK_STYLES = {
  critical:
    "border-red-300 bg-red-50 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:hover:bg-red-900/30",
  warning:
    "border-amber-200 bg-amber-50 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/20 dark:hover:bg-amber-900/30",
  low: "border-amber-200 bg-amber-50 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/20 dark:hover:bg-amber-900/30",
};
