"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Leaf, FlaskConical, Timer, BarChart3 } from "lucide-react";
import { WavyBackground } from "@/components/ui/wavy-background";
import { LayoutTextFlip } from "@/components/ui/layout-text-flip";
import { Button } from "@/components/ui/button";
import { LandingNav } from "./landing-nav";

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

const tags = ["Tea", "Herbs", "Blends", "Rituals"];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <WavyBackground
        backgroundFill="#030712"
        speed="slow"
        colors={["#34d399", "#2dd4bf", "#38bdf8", "#818cf8", "#a78bfa"]}
        containerClassName="min-h-[92vh]"
        className="flex min-h-[92vh] flex-col items-center justify-center px-6 pb-16 pt-24"
      >
        <LandingNav />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {tags.map((tag, i) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70 backdrop-blur-sm"
              >
                {tag}
              </motion.span>
            ))}
          </div>

          <LayoutTextFlip
            prefix="Craft perfect"
            words={["blends", "recipes", "rituals", "infusions"]}
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mx-auto mt-6 max-w-2xl text-base text-white/60 sm:text-lg"
          >
            Your complete workspace for artisan infusions — manage ingredients, design blends,
            save recipes, and brew with precision.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.45 }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link href="/register">
              <Button
                size="lg"
                className="min-w-[160px] border-0 bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 hover:bg-emerald-400"
              >
                Get started free
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="min-w-[160px] border-white/20 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10"
              >
                Sign in
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </WavyBackground>

      <section className="relative border-t border-white/5 bg-stone-950 px-6 py-20 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-6xl"
        >
          <h2 className="mb-2 text-center text-sm font-medium uppercase tracking-widest text-emerald-400/80">
            Everything you need
          </h2>
          <p className="mb-12 text-center text-2xl font-semibold text-white sm:text-3xl">
            Built for tea lovers and blend crafters
          </p>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group rounded-2xl border border-white/8 bg-white/[0.03] p-6 backdrop-blur-sm transition-colors hover:border-emerald-500/30 hover:bg-white/[0.06]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 transition-colors group-hover:bg-emerald-500/25">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-semibold text-white">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-white/50">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-sm text-white/40">
        Infusion Studio — Craft perfect blends, every time.
      </footer>
    </div>
  );
}
