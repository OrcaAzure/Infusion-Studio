import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 py-16 px-6 text-center dark:border-stone-600",
        className
      )}
    >
      <div className="mb-4 rounded-full bg-stone-100 p-4 text-stone-400 dark:bg-stone-800 dark:text-stone-500">
        {icon}
      </div>
      <h3 className="mb-1 text-lg font-semibold text-stone-900 dark:text-stone-100">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-stone-500 dark:text-stone-400">{description}</p>
      {action}
    </div>
  );
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
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
