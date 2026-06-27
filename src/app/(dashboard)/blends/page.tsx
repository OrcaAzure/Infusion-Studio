"use client";

import { useEffect, useState } from "react";
import { AppLink } from "@/components/ui/app-link";
import { Plus, FlaskConical } from "lucide-react";
import { DashboardHeader } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { CategoryBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner, EmptyState } from "@/components/ui/empty-state";
import type { BlendWithIngredients } from "@/types";

export default function BlendsPage() {
  const [blends, setBlends] = useState<BlendWithIngredients[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      fetch(`/api/blends${params}`)
        .then((r) => r.json())
        .then(setBlends)
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div>
      <DashboardHeader
        title="My Blends"
        description="All your crafted infusion blends"
        action={
          <AppLink href="/blends/create">
            <Button>
              <Plus className="h-4 w-4" />
              New blend
            </Button>
          </AppLink>
        }
      />

      <div className="mb-6">
        <Input
          placeholder="Search blends..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : blends.length === 0 ? (
        <EmptyState
          icon={<FlaskConical className="h-6 w-6" />}
          title="No blends yet"
          description="Create your first custom infusion blend"
          action={
            <AppLink href="/blends/create">
              <Button>Create blend</Button>
            </AppLink>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {blends.map((blend) => (
            <AppLink key={blend.id} href={`/blends/${blend.id}`}>
              <Card hover className="h-full">
                <h3 className="mb-1 font-semibold text-stone-900 dark:text-stone-100">
                  {blend.name}
                </h3>
                {blend.description && (
                  <p className="mb-3 line-clamp-2 text-sm text-stone-500">
                    {blend.description}
                  </p>
                )}
                <div className="mb-3 flex flex-wrap gap-1">
                  {blend.ingredients.slice(0, 4).map((bi) => (
                    <CategoryBadge key={bi.id} category={bi.ingredient.category} />
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span>{blend.ingredients.length} ingredients</span>
                  {blend.brewTime && <span>{Math.floor(blend.brewTime / 60)}m brew</span>}
                </div>
              </Card>
            </AppLink>
          ))}
        </div>
      )}
    </div>
  );
}
