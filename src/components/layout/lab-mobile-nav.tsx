"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Leaf,
  Droplets,
  Timer,
  Menu,
  type LucideIcon,
} from "lucide-react";
import { AppLink } from "@/components/ui/app-link";
import { useUIStore } from "@/stores";
import { cn } from "@/lib/utils";

const tabs: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/ingredients", label: "Stock", icon: Leaf },
  { href: "/blends", label: "Blends", icon: Droplets },
  { href: "/timer", label: "Timer", icon: Timer },
];

function normalizePath(path: string) {
  return path.replace(/\/$/, "") || "/";
}

/** Mobile bottom dock — website-style quick tabs (web alchemy theme). */
export function LabMobileNav() {
  const pathname = usePathname();
  const current = normalizePath(pathname);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  return (
    <nav
      className="lab-mobile-nav fixed bottom-0 left-0 right-0 z-50 md:hidden"
      aria-label="Quick navigation"
    >
      <div className="mx-3 mb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center gap-1 rounded-2xl border border-stone-200/80 bg-white/90 p-1.5 shadow-xl backdrop-blur-xl dark:border-stone-700/80 dark:bg-stone-900/90">
        {tabs.map(({ href, label, icon: Icon }) => {
          const target = normalizePath(href);
          const isActive =
            current === target || (target !== "/dashboard" && current.startsWith(target + "/"));
          return (
            <AppLink
              key={href}
              href={href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-medium transition-colors duration-100",
                isActive
                  ? "bg-emerald-600/12 text-emerald-700 dark:text-emerald-300 [.theme-alchemy_&]:bg-[color-mix(in_srgb,var(--alchemy-gold)_16%,transparent)] [.theme-alchemy_&]:text-[var(--alchemy-gold)]"
                  : "text-stone-500 dark:text-stone-400"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{label}</span>
            </AppLink>
          );
        })}
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-medium text-stone-500 dark:text-stone-400"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
          <span>More</span>
        </button>
      </div>
    </nav>
  );
}
