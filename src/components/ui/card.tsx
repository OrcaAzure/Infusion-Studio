import { cn, GLOW_COLORS } from "@/lib/utils";
import { type CSSProperties, type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glowColor?: string;
  /** Soft colored backlight behind the card */
  backlight?: boolean;
}

export function Card({
  className,
  hover,
  glowColor,
  backlight = true,
  children,
  ...props
}: CardProps) {
  const color = glowColor ?? GLOW_COLORS.brand;

  return (
    <div className="group relative min-w-0 overflow-hidden">
      {backlight && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute -inset-1 rounded-3xl opacity-40 blur-2xl transition-all duration-500",
            "bg-[radial-gradient(ellipse_at_50%_0%,var(--card-glow),transparent_65%)]",
            hover && "group-hover:opacity-70 group-hover:blur-3xl"
          )}
          style={{ "--card-glow": `${color}55` } as CSSProperties}
        />
      )}

      <div
        data-glow-color={color}
        className={cn(
          "relative min-w-0 rounded-2xl border p-4 shadow-sm backdrop-blur-md sm:p-6",
          "alchemy-card border-stone-200/80 bg-white/85 ring-1 ring-white/40 dark:border-stone-700/80 dark:bg-stone-900/85 dark:ring-white/5",
          "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit]",
          "before:bg-[radial-gradient(ellipse_at_50%_-20%,var(--card-glow-inner),transparent_55%)] before:opacity-60",
          hover &&
            "ui-lift transition-all duration-300 hover:border-emerald-200/80 hover:shadow-lg hover:shadow-emerald-500/12 dark:hover:border-emerald-800/80",
          className
        )}
        style={{ "--card-glow-inner": `${color}33` } as CSSProperties}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-semibold text-stone-900 dark:text-stone-100", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-stone-500 dark:text-stone-400", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}
