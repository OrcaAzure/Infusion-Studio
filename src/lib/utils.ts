import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes without conflicts */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format seconds into MM:SS display */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/** Format currency values — compact notation for very large amounts */
export function formatCurrency(amount: number): string {
  const locale =
    typeof navigator !== "undefined" ? navigator.language : "en-US";
  const currency = process.env.NEXT_PUBLIC_CURRENCY ?? "USD";
  const useCompact = Math.abs(amount) >= 1_000_000;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    ...(useCompact ? { notation: "compact", maximumFractionDigits: 2 } : {}),
  }).format(amount);
}

/** Human-readable category labels */
export const CATEGORY_LABELS: Record<string, string> = {
  TEA: "Tea",
  HERB: "Herb",
  SPICE: "Spice",
  FRUIT: "Fruit",
  FLOWER: "Flower",
  OTHER: "Other",
};

/** Parse flavor notes from Prisma Json field */
export function parseFlavorNotes(notes: unknown): string[] {
  if (Array.isArray(notes)) return notes.map(String);
  return [];
}
export const GLOW_COLORS: Record<string, string> = {
  TEA: "#10b981",
  HERB: "#22c55e",
  SPICE: "#f97316",
  FRUIT: "#eab308",
  FLOWER: "#a855f7",
  OTHER: "#78716c",
  brand: "#059669",
};

/** Category color mapping for badges */
export const CATEGORY_COLORS: Record<string, string> = {
  TEA: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  HERB: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  SPICE: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  FRUIT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  FLOWER: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  OTHER: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};
