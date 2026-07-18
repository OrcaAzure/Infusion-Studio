"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Leaf,
  Droplets,
  Timer,
  Home,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { AppLink } from "@/components/ui/app-link";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

const quickLinks: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ingredients", label: "Ingredients", icon: Leaf },
  { href: "/blends", label: "Blends", icon: Droplets },
  { href: "/timer", label: "Timer", icon: Timer },
];

function normalizePath(path: string) {
  return path.replace(/\/$/, "") || "/";
}

/** Website-style top bar inside the lab — quick nav + brand (web only). */
export function LabTopBar() {
  const pathname = usePathname();
  const current = normalizePath(pathname);

  return (
    <header className="lab-top-bar">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <AppLink
          href="/"
          className="alchemy-icon-badge flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl"
          aria-label="Back to welcome"
        >
          <Image src="/icons/icon-192.png" width={36} height={36} alt="" className="rounded-lg" />
        </AppLink>
        <div className="min-w-0">
          <p className="alchemy-label text-[10px] font-medium uppercase tracking-widest">Laboratory</p>
          <p className="truncate text-sm font-semibold text-stone-900 dark:text-stone-100">
            Infusion Studio
          </p>
        </div>
      </div>

      <nav
        className="hidden items-center gap-1 rounded-full border border-stone-200/80 bg-white/60 p-1 backdrop-blur-md dark:border-stone-700/80 dark:bg-stone-900/50 md:flex"
        aria-label="Quick navigation"
      >
        {quickLinks.map(({ href, label, icon: Icon }) => {
          const target = normalizePath(href);
          const isActive =
            current === target || (target !== "/dashboard" && current.startsWith(target + "/"));
          return (
            <AppLink
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150",
                isActive
                  ? "bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 [.theme-alchemy_&]:bg-[color-mix(in_srgb,var(--alchemy-gold)_18%,transparent)] [.theme-alchemy_&]:text-[var(--alchemy-gold)]"
                  : "text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </AppLink>
          );
        })}
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <AppLink
          href="/settings"
          className="flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100 md:hidden"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </AppLink>
        <AppLink
          href="/"
          className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-stone-500 transition-colors hover:text-stone-800 sm:flex dark:text-stone-400 dark:hover:text-stone-100"
        >
          <Home className="h-3.5 w-3.5" />
          Home
        </AppLink>
        <ThemeToggle />
      </div>
    </header>
  );
}
