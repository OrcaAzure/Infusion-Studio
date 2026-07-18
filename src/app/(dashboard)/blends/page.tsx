"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { AppLink } from "@/components/ui/app-link";
import { blendPath } from "@/lib/entity-path";
import { Plus, FlaskConical } from "lucide-react";
import { DashboardHeader } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { CategoryBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { LoadingSpinner, EmptyState } from "@/components/ui/empty-state";
import { useCachedFetch } from "@/hooks/use-cached-fetch";
import { isOfflineDemo } from "@/lib/offline-demo/api";
import type { BlendWithIngredients } from "@/types";

export default function BlendsPage() {
  const { status } = useSession();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"updatedAt" | "name" | "ingredients">("updatedAt");
  const enabled = isOfflineDemo() || status !== "loading";

  const { data: blends, loading } = useCachedFetch<BlendWithIngredients[]>(
    "blends",
    async () => {
      const r = await fetch("/api/blends");
      if (!r.ok) throw new Error("Failed to load blends");
      return r.json();
    },
    enabled
  );

  const list = blends ?? [];

  const visible = list
    .filter(
      (b) =>
        !search ||
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        (b.description ?? "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "ingredients") return b.ingredients.length - a.ingredients.length;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  return (
    <div>
      <DashboardHeader
        label="Crafting"
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

      <div className="mb-6 flex gap-2">
        <Input
          placeholder="Search blends..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="w-40 shrink-0"
          options={[
            { value: "updatedAt", label: "Newest" },
            { value: "name", label: "A–Z" },
            { value: "ingredients", label: "Most ingredients" },
          ]}
        />
      </div>

      {loading && list.length === 0 ? (
        <LoadingSpinner />
      ) : list.length === 0 ? (
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
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<FlaskConical className="h-6 w-6" />}
          title={`No blends matching "${search}"`}
          description="Try a different name"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((blend) => (
            <AppLink key={blend.id} href={blendPath(blend.id)} className="group block">
              <Card hover className="h-full">
                <h3 className="mb-1 font-semibold text-stone-900 transition-colors group-hover:text-emerald-600 dark:text-stone-100 dark:group-hover:text-emerald-400">
                  {blend.name}
                </h3>
                {blend.description && (
                  <p className="mb-3 line-clamp-2 text-sm text-stone-500">{blend.description}</p>
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
