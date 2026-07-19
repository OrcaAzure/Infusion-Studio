"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Leaf,
  FlaskConical,
  BookOpen,
  Heart,
  Timer,
  Clock,
  LogOut,
  Droplets,
  Instagram,
  Smartphone,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { AppLink } from "@/components/ui/app-link";
import { isOfflineApk } from "@/lib/offline-demo/api";

const mainNavItems: { href: string; label: string; icon: LucideIcon; tourId?: string }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ingredients", label: "Ingredients", icon: Leaf, tourId: "ingredients" },
  { href: "/blends", label: "My Blends", icon: Droplets },
  { href: "/blends/create", label: "Blend Creator", icon: FlaskConical, tourId: "blend-creator" },
  { href: "/timer", label: "Brew Timer", icon: Timer, tourId: "timer" },
  { href: "/brew-logs", label: "Brew History", icon: Clock },
  { href: "/recipes", label: "Recipes", icon: BookOpen },
  { href: "/favorites", label: "Favorites", icon: Heart },
];

const promoNavItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/oven-infusion", label: "Oven Infusion", icon: Instagram },
  { href: "/qa", label: "QA / Install", icon: Smartphone },
];

function normalizePath(path: string) {
  return path.replace(/\/$/, "") || "/";
}

function NavLink({
  href,
  label,
  icon: Icon,
  tourId,
  isActive,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  tourId?: string;
  isActive: boolean;
  onNavigate: () => void;
}) {
  return (
    <AppLink
      href={href}
      data-tour={tourId}
      onClick={onNavigate}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
        isActive
          ? "text-emerald-700 dark:text-emerald-300 [.theme-alchemy_&]:text-[var(--alchemy-gold)]"
          : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 [.theme-alchemy_&]:text-stone-400 [.theme-alchemy_&]:hover:text-emerald-100"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "alchemy-nav-pill absolute inset-0 rounded-lg transition-[opacity,transform] duration-200 ease-out",
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"
        )}
      />
      <span
        aria-hidden
        className={cn(
          "alchemy-nav-accent absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full transition-all duration-200 ease-out",
          isActive ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
        )}
      />
      <Icon
        className={cn(
          "relative z-10 h-4 w-4 transition-transform duration-200",
          isActive && "text-emerald-600 dark:text-emerald-400 [.theme-alchemy_&]:text-[var(--alchemy-gold)]",
          "group-hover:scale-110"
        )}
      />
      <span className="relative z-10">{label}</span>
    </AppLink>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const offline = isOfflineApk();
  const current = normalizePath(pathname);

  const closeSidebar = () => setSidebarOpen(false);

  const renderNav = (items: typeof mainNavItems) =>
    items.map(({ href, label, icon, tourId }) => {
      const target = normalizePath(href);
      const isActive =
        current === target || (target !== "/dashboard" && current.startsWith(target + "/"));
      return (
        <div key={href}>
          <NavLink
            href={href}
            label={label}
            icon={icon}
            tourId={tourId}
            isActive={isActive}
            onNavigate={closeSidebar}
          />
        </div>
      );
    });

  const NavContent = () => (
    <>
      <div className="mb-6 flex shrink-0 items-center gap-3 px-2 pt-[env(safe-area-inset-top)] lg:pt-0">
        <Image
          src="/icons/icon-192.png"
          width={40}
          height={40}
          alt="Infusion Studio"
          className="rounded-xl shadow-sm"
        />
        <div>
          <h1 className="text-lg font-bold text-stone-900 dark:text-stone-100">Infusion Studio</h1>
          <p className="text-xs text-stone-500">Craft perfect blends</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <nav className="space-y-1">{renderNav(mainNavItems)}</nav>

        <nav className="mt-4 space-y-1 border-t border-stone-200 pt-4 dark:border-stone-700">
          {(offline
            ? promoNavItems.filter((item) => item.href !== "/qa")
            : promoNavItems
          ).map(({ href, label, icon }) => {
            const target = normalizePath(href);
            const isActive = current === target || current.startsWith(target + "/");
            return (
              <NavLink
                key={href}
                href={href}
                label={label}
                icon={icon}
                isActive={isActive}
                onNavigate={closeSidebar}
              />
            );
          })}
        </nav>
      </div>

      <div className="mt-3 shrink-0 space-y-4 border-t border-stone-200 pt-4 dark:border-stone-700">
        <ThemeToggle className="w-full justify-center" />
        <AppLink href="/settings" onClick={closeSidebar}>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-stone-600 dark:text-stone-400"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </AppLink>
        {session?.user && (
          <div className="px-2">
            <p className="truncate text-sm font-medium text-stone-900 dark:text-stone-100">
              {session.user.name}
            </p>
            <p className="truncate text-xs text-stone-500">{session.user.email}</p>
          </div>
        )}
        {!offline && (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-stone-600 dark:text-stone-400"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        )}
      </div>
    </>
  );

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed z-50 flex w-64 flex-col overflow-hidden border-r p-4 backdrop-blur-xl transition-transform duration-200 ease-out",
          "alchemy-sidebar border-stone-200/80 bg-white/85 dark:border-stone-700/80 dark:bg-stone-900/85",
          offline ? "inset-y-0 left-0" : "fluid-sidebar",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <NavContent />
        </div>
      </aside>
    </>
  );
}

export function DashboardHeader({
  title,
  description,
  action,
  icon: Icon,
  label,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
  /** Small caps label above title (website section style). */
  label?: string;
}) {
  return (
    <div className="mb-6 flex min-w-0 flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
      <div className="lab-page-header min-w-0 flex-1">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="alchemy-icon-badge mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0">
            {label && (
              <p className="alchemy-label mb-1 text-[10px] font-medium uppercase tracking-widest">
                {label}
              </p>
            )}
            <h1 className="text-xl font-bold text-stone-900 sm:text-2xl dark:text-stone-100">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{description}</p>
            )}
          </div>
        </div>
      </div>
      {action && (
        <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          {action}
        </div>
      )}
    </div>
  );
}
