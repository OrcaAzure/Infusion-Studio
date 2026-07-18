"use client";

import Image from "next/image";
import { ArrowRight, FlaskConical, Leaf, Sparkles, Timer } from "lucide-react";
import { WavyBackground } from "@/components/ui/wavy-background";
import { Button } from "@/components/ui/button";
import { AppLink } from "@/components/ui/app-link";
import { FluidCanvas, FluidStage } from "@/components/layout/fluid-stage";
import { ALCHEMY, ALCHEMY_WAVE_COLORS } from "@/lib/alchemy-theme";

const highlights = [
  { icon: Leaf, label: "Ingredients", desc: "Stock your apothecary" },
  { icon: FlaskConical, label: "Blends", desc: "Craft perfect brews" },
  { icon: Timer, label: "Brew timer", desc: "Time every infusion" },
];

/** Welcome — fluid framed showcase with alchemy waves inside a rounded stage. */
export function WelcomePage() {
  return (
    <FluidCanvas className="alchemy-shell">
      <FluidStage bleed className="min-h-[calc(100dvh-1.25rem)] lg:min-h-[calc(100dvh-2.5rem)]">
        <WavyBackground
          backgroundFill={ALCHEMY.void}
          waveOpacity={0.55}
          blur={12}
          speed="slow"
          waveWidth={52}
          colors={ALCHEMY_WAVE_COLORS}
          containerClassName="min-h-[calc(100dvh-1.25rem)] lg:min-h-[calc(100dvh-2.5rem)]"
          className="flex min-h-[inherit] flex-col justify-center px-6 py-12 sm:px-10 lg:px-14"
        >
          <div
            className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit] bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(201,162,39,0.08),transparent)]"
            aria-hidden
          />

          <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <div className="alchemy-icon-badge mb-8 rounded-2xl p-1">
                <Image
                  src="/icons/icon-192.png"
                  width={80}
                  height={80}
                  alt="Infusion Studio"
                  className="rounded-xl"
                  priority
                />
              </div>

              <p className="alchemy-label mb-3 flex items-center justify-center gap-2 text-sm font-medium uppercase lg:justify-start">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Infusion Studio
              </p>

              <h1 className="alchemy-hero-glow text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
                Brew.
                <br />
                Blend.
                <br />
                Perfect.
              </h1>

              <p className="mt-5 max-w-md text-base text-emerald-100/75 sm:text-lg">
                Your alchemy lab for teas, herbs, and brews — blend, measure, and perfect every infusion.
              </p>

        <div className="mt-10">
          <AppLink href="/dashboard" className="welcome-enter-lab inline-block">
                  <Button
                    size="lg"
                    className="alchemy-btn-primary min-w-[220px] gap-2 border-0 text-white"
                    data-testid="welcome-enter-lab"
                  >
                    Enter the laboratory
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </AppLink>
              </div>
            </div>

            <div className="fluid-inset mx-auto w-full max-w-md p-6 sm:p-8 lg:max-w-none">
              <p className="alchemy-label mb-2 text-xs font-medium uppercase">Inside the lab</p>
              <h2 className="text-xl font-semibold text-white sm:text-2xl">
                See what you can craft
              </h2>
              <div className="mt-6 space-y-3">
                {highlights.map(({ icon: Icon, label, desc }) => (
                  <div
                    key={label}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                  >
                    <div className="alchemy-icon-badge flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="font-medium text-white">{label}</p>
                      <p className="text-sm text-emerald-100/65">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </WavyBackground>
      </FluidStage>
    </FluidCanvas>
  );
}
