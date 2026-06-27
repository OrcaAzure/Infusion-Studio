"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Leaf,
  FlaskConical,
  BookOpen,
  Heart,
  Timer,
  LogOut,
  Menu,
  X,
  Droplets,
  Instagram,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ingredients", label: "Ingredients", icon: Leaf },
  { href: "/blends/create", label: "Blend Creator", icon: FlaskConical },
  { href: "/blends", label: "My Blends", icon: Droplets },
  { href: "/recipes", label: "Recipes", icon: BookOpen },
  { href: "/oven-infusion", label: "Oven Infusion", icon: Instagram },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/timer", label: "Brew Timer", icon: Timer },
  { href: "/qa", label: "QA / Install", icon: Smartphone },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const NavContent = () => (
    <>
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <Droplets className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-stone-900 dark:text-stone-100">Infusion Studio</h1>
          <p className="text-xs text-stone-500">Craft perfect blends</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4 border-t border-stone-200 pt-4 dark:border-stone-700">
        <ThemeToggle className="w-full justify-center" />
        {session?.user && (
          <div className="px-2">
            <p className="truncate text-sm font-medium text-stone-900 dark:text-stone-100">
              {session.user.name}
            </p>
            <p className="truncate text-xs text-stone-500">{session.user.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-stone-600 dark:text-stone-400"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-40 lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-stone-200/80 bg-white/80 p-4 backdrop-blur-xl transition-transform duration-300 dark:border-stone-700/80 dark:bg-stone-900/80",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NavContent />
      </aside>
    </>
  );
}

export function DashboardHeader({ title, description, action }: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="pl-12 lg:pl-0">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{description}</p>
        )}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
