"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
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
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  index = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={cn("relative overflow-hidden", className)}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400">{title}</p>
            <p className="mt-1 text-3xl font-bold text-stone-900 dark:text-stone-100">{value}</p>
            {description && (
              <p className="mt-1 text-xs text-stone-400">{description}</p>
            )}
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
    </motion.div>
  );
}

interface CategoryChartProps {
  data: { category: string; count: number }[];
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
  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;

  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={item.category}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-medium text-stone-700 dark:text-stone-300">
              {item.category}
            </span>
            <span className="text-stone-500">{item.count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
            <motion.div
              className={cn("h-full rounded-full", CHART_COLORS[i % CHART_COLORS.length])}
              initial={{ width: 0 }}
              animate={{ width: `${(item.count / total) * 100}%` }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            />
          </div>
        </div>
      ))}
      {data.length === 0 && (
        <p className="text-center text-sm text-stone-400">No data yet</p>
      )}
    </div>
  );
}
