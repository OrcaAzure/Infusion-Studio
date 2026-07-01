"use client";

import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { WavyBackground } from "@/components/ui/wavy-background";
import { Button } from "@/components/ui/button";
import { AppLink } from "@/components/ui/app-link";
import { ALCHEMY, ALCHEMY_WAVE_COLORS } from "@/lib/alchemy-theme";

/** Welcome — alchemy laboratory: brewing greens & brass vapour waves. */
export function WelcomePage() {
  return (
    <WavyBackground
      backgroundFill={ALCHEMY.void}
      waveOpacity={0.55}
      blur={12}
      speed="slow"
      waveWidth={52}
      colors={ALCHEMY_WAVE_COLORS}
      containerClassName="min-h-dvh"
      className="flex min-h-dvh flex-col items-center justify-center px-6"
    >
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(201,162,39,0.08),transparent)]"
        aria-hidden
      />

      <div className="relative z-10 flex max-w-md flex-col items-center text-center">
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

        <p className="alchemy-label mb-2 flex items-center justify-center gap-2 text-sm font-medium uppercase">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Infusion Studio
        </p>

        <h1 className="alchemy-hero-glow text-5xl font-bold tracking-tight text-white sm:text-6xl">
          Welcome
        </h1>

        <p className="mt-4 text-base text-emerald-100/75 sm:text-lg">
          Your alchemy lab for teas, herbs, and brews — blend, measure, and perfect every infusion.
        </p>

        <div className="mt-10">
          <AppLink href="/dashboard">
            <Button size="lg" className="alchemy-btn-primary min-w-[220px] gap-2 border-0 text-white">
              Enter the laboratory
              <ArrowRight className="h-4 w-4" />
            </Button>
          </AppLink>
        </div>
      </div>
    </WavyBackground>
  );
}
