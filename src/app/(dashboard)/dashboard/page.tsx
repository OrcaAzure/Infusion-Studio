"use client";

import { useSession } from "next-auth/react";
import {
  Leaf,
  FlaskConical,
  BookOpen,
  Heart,
  AlertTriangle,
  DollarSign,
  Package,
  Flame,
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/sidebar";
import { StatCard, CategoryChart, lowStockSeverity, LOW_STOCK_STYLES } from "@/components/dashboard/stats";
import { LowStockShoppingList } from "@/components/dashboard/low-stock-shopping-list";
import { Card, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/empty-state";
import { CategoryBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppLink } from "@/components/ui/app-link";
import { formatCurrency, CATEGORY_LABELS } from "@/lib/utils";
import { ingredientPath, blendPath } from "@/lib/entity-path";
import { useCachedFetch } from "@/hooks/use-cached-fetch";
import type { DashboardStats } from "@/types";
import { isOfflineDemo } from "@/lib/offline-demo/api";

export default function DashboardPage() {
  const { status } = useSession();
  const enabled = isOfflineDemo() || status !== "loading";

  const { data: stats, loading } = useCachedFetch<DashboardStats>(
    "dashboard",
    async () => {
      const r = await fetch("/api/dashboard");
      if (!r.ok) throw new Error("Failed to load dashboard");
      return r.json();
    },
    enabled
  );

  if (loading && !stats) return <LoadingSpinner />;
  if (!stats) return <p>Failed to load dashboard</p>;

  const categoryData = stats.categoryBreakdown.map((c) => ({
    category: CATEGORY_LABELS[c.category] ?? c.category,
    key: c.category,
    count: c.count,
  }));

  return (
    <div>
      <DashboardHeader
        label="Overview"
        title="Dashboard"
        description="Overview of your infusion studio"
        action={
          <AppLink href="/blends/create" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">Create blend</Button>
          </AppLink>
        }
      />

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4">
        <StatCard title="Ingredients" value={stats.totalIngredients} icon={Leaf} index={0} href="/ingredients" />
        <StatCard title="Blends" value={stats.totalBlends} icon={FlaskConical} index={1} href="/blends" />
        <StatCard title="Recipes" value={stats.totalRecipes} icon={BookOpen} index={2} href="/recipes" />
        <StatCard title="Favorites" value={stats.favoriteCount} icon={Heart} index={3} href="/favorites" />
        <StatCard
          title="Brew streak"
          value={
            (stats.brewStreak ?? 0) === 0
              ? "—"
              : `${stats.brewStreak} day${stats.brewStreak !== 1 ? "s" : ""}`
          }
          icon={Flame}
          index={4}
          href="/brew-logs"
        />
      </div>

      <Card className="mb-6">
        <CardTitle className="mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-emerald-600" />
          Inventory
        </CardTitle>

        <div className="mb-6 rounded-lg border border-stone-200 bg-stone-50/50 p-4 dark:border-stone-700 dark:bg-stone-800/30">
          <div className="mb-1 flex items-center gap-2 text-sm font-medium text-stone-600 dark:text-stone-400">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            Inventory value
          </div>
          <p className="max-w-full truncate text-3xl font-bold text-stone-900 dark:text-stone-100">
            {formatCurrency(stats.totalInventoryValue)}
          </p>
          <p className="mt-1 text-sm text-stone-500">Total stock value</p>
        </div>

        <Card className="mb-6 rounded-lg border border-stone-200 bg-stone-50/50 p-4 dark:border-stone-700 dark:bg-stone-800/30">
          <h3 className="mb-3 text-sm font-semibold text-stone-700 dark:text-stone-300">
            By category
          </h3>
          <CategoryChart data={categoryData} />
        </Card>

        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-300">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Low stock alerts
          </h3>
          {stats.lowStockItems.length > 0 ? (
            <>
              <div className="space-y-2">
                {stats.lowStockItems.map((item) => {
                  const severity = lowStockSeverity(item.quantity);
                  return (
                    <AppLink
                      key={item.id}
                      href={ingredientPath(item.id)}
                      className={`flex min-w-0 items-center justify-between gap-2 rounded-lg border p-3 transition-colors ${LOW_STOCK_STYLES[severity]}`}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-stone-900 dark:text-stone-100">{item.name}</p>
                        <CategoryBadge category={item.category} />
                      </div>
                      <span className="shrink-0 text-sm font-medium text-amber-700 dark:text-amber-400">
                        {item.quantity} {item.unit}
                      </span>
                    </AppLink>
                  );
                })}
              </div>
              <LowStockShoppingList items={stats.lowStockItems} />
            </>
          ) : (
            <p className="text-sm text-stone-500">All ingredients are well stocked</p>
          )}
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-4">Recent blends</CardTitle>
        {stats.recentBlends.length > 0 ? (
          <div className="space-y-3">
            {stats.recentBlends.map((blend) => (
              <AppLink
                key={blend.id}
                href={blendPath(blend.id)}
                className="flex items-center justify-between rounded-lg border border-stone-200 p-3 transition-colors hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-800"
              >
                <div>
                  <p className="font-medium text-stone-900 dark:text-stone-100">{blend.name}</p>
                  <p className="text-xs text-stone-500">
                    {blend.ingredients.length} ingredients
                  </p>
                </div>
                <span className="text-xs text-stone-400">
                  {blend._count?.recipes ?? 0} recipes
                </span>
              </AppLink>
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-500">No blends yet</p>
        )}
      </Card>
    </div>
  );
}
