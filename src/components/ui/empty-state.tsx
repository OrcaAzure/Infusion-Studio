"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SOFT_EASE } from "@/components/ui/motion";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  const reduce = useReducedMotion();

  const body = (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50/50 py-16 px-6 text-center dark:border-stone-600 dark:bg-stone-900/30",
        className
      )}
    >
      <div
        className="mb-4 rounded-full bg-gradient-to-br from-emerald-50 to-stone-100 p-4 text-emerald-500 shadow-inner dark:from-emerald-950/50 dark:to-stone-800 dark:text-emerald-400"
        style={reduce ? undefined : { animation: "ui-float 3s ease-in-out infinite" }}
      >
        {icon}
      </div>
      <h3 className="mb-1 text-lg font-semibold text-stone-900 dark:text-stone-100">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-stone-500 dark:text-stone-400">{description}</p>
      {action}
    </div>
  );

  if (reduce) return body;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.28, ease: SOFT_EASE }}
    >
      {body}
    </motion.div>
  );
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-2 border-emerald-200 dark:border-emerald-900" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    </div>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
      {message}
    </div>
  );
}
