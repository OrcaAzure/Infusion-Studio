"use client";

import { useEffect, useState } from "react";
import { Instagram, Sparkles } from "lucide-react";
import { DashboardHeader } from "@/components/layout/sidebar";
import { OvenInfusionCard } from "@/components/discover/oven-infusion-card";
import { LoadingSpinner, EmptyState } from "@/components/ui/empty-state";
import { FadeIn } from "@/components/ui/motion";
import { GLOW_COLORS } from "@/lib/utils";
import type { SharedRecipe } from "@/types";

export default function OvenInfusionPage() {
  const [featured, setFeatured] = useState<SharedRecipe[]>([]);
  const [community, setCommunity] = useState<SharedRecipe[]>([]);
  const [handle, setHandle] = useState("oven_infusion");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/discover").then((r) => r.json()),
      fetch("/api/profile").then((r) => r.json()),
    ]).then(([discover, profile]) => {
      setFeatured(discover.featured ?? []);
      setCommunity(discover.community ?? []);
      if (profile?.socialHandle) setHandle(profile.socialHandle);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      {/* Hero banner */}
      <FadeIn>
        <div
          className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-8 text-white"
          data-glow-color={GLOW_COLORS.brand}
        >
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-white/10 blur-xl" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Instagram className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">your infusion journal</p>
              <h1 className="text-3xl font-bold">@{handle}</h1>
              <p className="mt-1 text-sm text-white/70">
                Share recipes · Get recommendations · Inspire brewers
              </p>
            </div>
          </div>
        </div>
      </FadeIn>

      {loading ? (
        <LoadingSpinner />
      ) : community.length === 0 ? (
        <EmptyState
          icon={<Instagram className="h-6 w-6" />}
          title="No shared recipes yet"
          description="Go to Recipes and share your first blend to @oven_infusion"
        />
      ) : (
        <>
          {/* Recommendations */}
          {featured.length > 0 && (
            <section className="mb-10">
              <DashboardHeader
                title="Recommended for you"
                description="Top picks from the Oven Infusion community"
              />
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((recipe) => (
                  <OvenInfusionCard key={recipe.id} recipe={recipe} featured />
                ))}
              </div>
            </section>
          )}

          {/* Community feed */}
          <section>
            <div className="mb-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                From the feed
              </h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {community.map((recipe) => (
                <OvenInfusionCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
