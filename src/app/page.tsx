import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Droplets, Leaf, FlaskConical, Timer, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";

const features = [
  {
    icon: Leaf,
    title: "Ingredient Inventory",
    description: "Track teas, herbs, spices, and more with detailed flavor profiles.",
  },
  {
    icon: FlaskConical,
    title: "Blend Creator",
    description: "Drag and drop ingredients to craft your perfect infusion blends.",
  },
  {
    icon: Timer,
    title: "Brew Timer",
    description: "Precision timing with visual countdown and completion alerts.",
  },
  {
    icon: BarChart3,
    title: "Dashboard Analytics",
    description: "Insights into your inventory, blends, and brewing habits.",
  },
];

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-stone-50 to-teal-50 dark:from-stone-950 dark:via-stone-900 dark:to-emerald-950" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 text-center">
          <FadeIn>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25">
              <Droplets className="h-8 w-8" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-6xl">
              Infusion Studio
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-600 dark:text-stone-400">
              Your complete workspace for crafting artisan infusions. Manage ingredients,
              design blends, save recipes, and brew with precision.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/register">
                <Button size="lg">Get started free</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign in
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </header>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <div className="rounded-xl border border-stone-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-stone-700 dark:bg-stone-900">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-semibold text-stone-900 dark:text-stone-100">
                  {feature.title}
                </h3>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  {feature.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <footer className="border-t border-stone-200 py-8 text-center text-sm text-stone-500 dark:border-stone-700">
        Infusion Studio — Craft perfect blends, every time.
      </footer>
    </div>
  );
}
