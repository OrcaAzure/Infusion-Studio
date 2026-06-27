import { cn } from "@/lib/utils";
import { CATEGORY_COLORS, CATEGORY_LABELS, GLOW_COLORS } from "@/lib/utils";

interface BadgeProps {
  category: string;
  className?: string;
}

export function CategoryBadge({ category, className }: BadgeProps) {
  return (
    <span
      data-glow-color={GLOW_COLORS[category] ?? GLOW_COLORS.OTHER}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        CATEGORY_COLORS[category] ?? CATEGORY_COLORS.OTHER,
        className
      )}
    >
      {CATEGORY_LABELS[category] ?? category}
    </span>
  );
}

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info";
  className?: string;
}

const statusVariants = {
  success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  danger: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
};

export function StatusBadge({ children, variant = "info", className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusVariants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
