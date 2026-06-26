"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Leaf,
  FlaskConical,
  BookOpen,
  Heart,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/sidebar";
import { StatCard, CategoryChart } from "@/components/dashboard/stats";
import { Card, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/empty-state";
import { CategoryBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, CATEGORY_LABELS } from "@/lib/utils";
import type { DashboardStats } from "@/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!stats) return <p>Failed to load dashboard</p>;

  const categoryData = stats.categoryBreakdown.map((c) => ({
    category: CATEGORY_LABELS[c.category] ?? c.category,
    count: c.count,
  }));

  return (
    <div>
      <DashboardHeader
        title="Dashboard"
        description="Overview of your infusion studio"
        action={
          <Link href="/blends/create">
            <Button>Create blend</Button>
          </Link>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Ingredients" value={stats.totalIngredients} icon={Leaf} index={0} />
        <StatCard title="Blends" value={stats.totalBlends} icon={FlaskConical} index={1} />
        <StatCard title="Recipes" value={stats.totalRecipes} icon={BookOpen} index={2} />
        <StatCard
          title="Favorites"
          value={stats.favoriteCount}
          icon={Heart}
          index={3}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle className="mb-4">Inventory by Category</CardTitle>
          <CategoryChart data={categoryData} />
        </Card>

        <Card>
          <CardTitle className="mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            Inventory Value
          </CardTitle>
          <p className="text-3xl font-bold text-stone-900 dark:text-stone-100">
            {formatCurrency(stats.totalInventoryValue)}
          </p>
          <p className="mt-1 text-sm text-stone-500">Total stock value</p>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Low stock alerts */}
        <Card>
          <CardTitle className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Low Stock Alerts
          </CardTitle>
          {stats.lowStockItems.length > 0 ? (
            <div className="space-y-3">
              {stats.lowStockItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/ingredients/${item.id}`}
                  className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-3 transition-colors hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/20 dark:hover:bg-amber-900/30"
                >
                  <div>
                    <p className="font-medium text-stone-900 dark:text-stone-100">{item.name}</p>
                    <CategoryBadge category={item.category} />
                  </div>
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    {item.quantity} {item.unit}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-500">All ingredients are well stocked</p>
          )}
        </Card>

        {/* Recent blends */}
        <Card>
          <CardTitle className="mb-4">Recent Blends</CardTitle>
          {stats.recentBlends.length > 0 ? (
            <div className="space-y-3">
              {stats.recentBlends.map((blend) => (
                <Link
                  key={blend.id}
                  href={`/blends/${blend.id}`}
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
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-500">No blends yet</p>
          )}
        </Card>
      </div>
    </div>
  );
}
